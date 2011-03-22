describe("Inferer", function() {
  var Inferer = Ibis.Inferer;
  var Parser = Ibis.Parser;
  var Type = Ibis.Type;
  var Env = Ibis.Env;
  
  var env = Env.createGlobal({
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
  
  it("can infer types of constants", function() {
    expect(inferFromString("123")).toEqual("int");
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
  
  it("can infer polymorphic types", function() {
    expect(inferFromString("fun x -> x")).toEqual("('a -> 'a)");
    expect(inferFromString("fun x -> fun y -> x")).toEqual("('a -> ('b -> 'a))");
    expect(inferFromString("let id = fun x -> x")).toEqual("('a -> 'a)");
    expect(inferFromString("id 1")).toEqual("int");
    expect(inferFromString("id id")).toEqual("('a -> 'a)");
    expect(inferFromString("let const = fun x -> fun y -> x")).toEqual("('a -> ('b -> 'a))");
  });
  
  function inferFromString(string) {
    var parser = Parser.ofString(string);
    var expr = Parser.parse(parser);
    return Inferer.infer(env, expr).toString();
  }
});
