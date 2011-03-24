describe("Inferer", function() {
  var Inferer = Ibis.Inferer;
  var Parser = Ibis.Parser;
  var Type = Ibis.Type;
  var Env = Ibis.Env;
  
  var ctxt = Env.createGlobal({
    "answer": Type.createTypeSchema(
      [], Type.Int
    ),
    "double": Type.createTypeSchema(
      [], Type.createFun(Type.Int, Type.Int)
    ),
    "+": Type.createTypeSchema(
      [], Type.createFun(Type.Int, Type.createFun(Type.Int, Type.Int))
    ),
    "*": Type.createTypeSchema(
      [], Type.createFun(Type.Int, Type.createFun(Type.Int, Type.Int))
    )
  });
  var env = Env.createGlobal({
    "unit": Type.Unit,
    "int": Type.Int,
    "bool": Type.Bool
  });
  
  it("can infer types of constants", function() {
    expect(inferFromString("123")).toEqual("int");
    expect(inferFromString("true")).toEqual("bool");
    expect(inferFromString("false")).toEqual("bool");
    expect(inferFromString("()")).toEqual("unit");
  });
  
  it("can infer types of variables", function () {
    expect(inferFromString("answer")).toEqual("int");
    expect(inferFromString("double")).toEqual("(int -> int)");
  });
  
  it("can infer types of function abstractions", function() {
    expect(inferFromString("fun x -> x * 2")).toEqual("(int -> int)");
    expect(inferFromString("fun n -> fun m -> n + m")).toEqual("(int -> (int -> int))");
  });
  
  it("can infer types of function applications", function() {
    expect(inferFromString("double 2")).toEqual("int");
    expect(inferFromString("1 + 2 * 3")).toEqual("int");
    expect(inferFromString("(1 + 2) * 3")).toEqual("int");
  });
  
  it("can infer types of let expressions", function() {
    expect(inferFromString("let x = 1")).toEqual("int");
    expect(inferFromString("x")).toEqual("int");
  });
  
  it("can infer types of let-rec expressions", function() {
    expect(inferFromString("let rec f = fun x -> f x")).toEqual("('a -> 'b)");
    expect(inferFromString("f")).toEqual("('a -> 'b)");
  });
  
  it("can infer types of let-tuple expressions", function() {
    expect(inferFromString("let (a, b) = (1, true)")).toEqual("(int * bool)");
    expect(inferFromString("a")).toEqual("int");
    expect(inferFromString("b")).toEqual("bool");
  });
  
  it("can infer polymorphic types", function() {
    expect(inferFromString("fun x -> x")).toEqual("('a -> 'a)");
    expect(inferFromString("fun x -> fun y -> x")).toEqual("('a -> ('b -> 'a))");
    expect(inferFromString("let id = fun x -> x")).toEqual("('a -> 'a)");
    expect(inferFromString("id 1")).toEqual("int");
    expect(inferFromString("id id")).toEqual("('a -> 'a)");
    expect(inferFromString("let const = fun x -> fun y -> x")).toEqual("('a -> ('b -> 'a))");
  });
  
  it("can infer types of if expressions", function() {
    expect(inferFromString("if true then 1 else 0")).toEqual("int");
    expect(inferFromString("if false then 1 else 0")).toEqual("int");
  });
  
  it("can infer types of tuples", function() {
    expect(inferFromString("(1, true)")).toEqual("(int * bool)");
    expect(inferFromString("(x, false, 3)")).toEqual("(int * bool * int)");
  });
  
  it("can define variant types", function() {
    var num = "type num = Zero of unit | Pos of int | Neg of int";
    expect(inferFromString(num)).toEqual("unit");
    var num2 = "type num2 = Num2 of num * num";
    expect(inferFromString(num2)).toEqual("unit");
  });
  
  it("can infer types of constructors", function() {
    expect(inferFromString("Zero")).toEqual("(unit -> num)");
    expect(inferFromString("Pos")).toEqual("(int -> num)");
    expect(inferFromString("Neg")).toEqual("(int -> num)");
    expect(inferFromString("Num2")).toEqual("((num * num) -> num2)");
  });
  
  function inferFromString(string) {
    var parser = Parser.ofString(string);
    var expr = Parser.parse(parser);
    return Inferer.infer(ctxt, env, expr).toString();
  }
});
