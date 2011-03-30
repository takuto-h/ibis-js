describe("Inferer", function() {
  var Inferer = Ibis.Inferer;
  var Parser = Ibis.Parser;
  var Type = Ibis.Type;
  var Env = Ibis.Env;
  var Default = Ibis.Default;
  
  var env = Default.createEnv();
  var typeCtxt = env.typeCtxt;
  var typeEnv = env.typeEnv;
  var variants = Env.createGlobal({});
  
  Env.add(typeCtxt, "answer", Type.createTypeSchema([], Type.Int));
  Env.add(typeCtxt, "double", Type.createTypeSchema([], Type.createFun(Type.Int, Type.Int)));
  
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
  
  it("can infer types of case expressions", function () {
    expect(inferFromString("let n = Zero ()")).toEqual("num");
    var string = "case n of ";
    string += "Zero -> fun _ -> 0 | ";
    string += "Pos -> fun _ -> 1 | ";
    string += "Neg -> fun _ -> 0 - 1";
    expect(inferFromString(string)).toEqual("int");
    var string2 = "case n of ";
    string2 += "Zero -> fun _ -> false | ";
    string2 += "else -> fun _ -> true";
    expect(inferFromString(string2)).toEqual("bool");
  });
  
  it("can infer types of case expressions in functions", function () {
    var string = "let num_to_int = fun n -> case n of ";
    string += "Zero -> fun _ -> 0 | ";
    string += "Pos -> fun i -> i | ";
    string += "Neg -> fun i -> 0 - i";
    expect(inferFromString(string)).toEqual("(num -> int)");
    expect(inferFromString("num_to_int (Zero ())")).toEqual("int");
    expect(inferFromString("num_to_int (Pos 123)")).toEqual("int");
    expect(inferFromString("num_to_int (Neg 123)")).toEqual("int");
  });
  
  it("can infer recursive types", function () {
    expect(inferFromString("type nat = Zero of unit | Succ of nat")).toEqual("unit");
    expect(inferFromString("let zero = Zero ()")).toEqual("nat");
    expect(inferFromString("let one = Succ zero")).toEqual("nat");
    expect(inferFromString("let two = Succ one")).toEqual("nat");
    var string = "let rec add = fun m -> fun n -> ";
    string += "case m of ";
    string += "Zero -> fun _ -> n | ";
    string += "Succ -> fun k -> Succ (add k n)";
    expect(inferFromString(string)).toEqual("(nat -> (nat -> nat))");
    expect(inferFromString("add one")).toEqual("(nat -> nat)");
    expect(inferFromString("add one two")).toEqual("nat");
  });
  
  it("can evaluate type expressions", function() {
    var t = "type t = T of int -> int";
    expect(inferFromString(t)).toEqual("unit");
    var f = "let f = T (fun x -> x)";
    expect(inferFromString(f)).toEqual("t");
    var g = "case f of T -> fun g -> g 123";
    expect(inferFromString(g)).toEqual("int");
  });
  
  function inferFromString(string) {
    var parser = Parser.ofString(string);
    var expr = Parser.parse(parser);
    return Inferer.infer(typeCtxt, typeEnv, variants, expr).toString();
  }
});
