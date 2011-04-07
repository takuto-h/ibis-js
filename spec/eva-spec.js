describe("Eva", function() {
  var Eva = Ibis.Eva;
  var Parser = Ibis.Parser;
  var Value = Ibis.Value;
  var Env = Ibis.Env;
  var Default = Ibis.Default;
  
  var env = Default.createEnv();
  var valueEnv = env.valueEnv;
  
  Env.add(valueEnv, "answer", Value.createInt(42));
  Env.add(valueEnv, "double",
    Value.createSubr(function (n) {
      return Value.createInt(n.intValue * 2);
    })
  );
  
  it("can evaluate constants", function() {
    expect(evalFromString("123")).toEqual("123");
    expect(evalFromString("true")).toEqual("true");
    expect(evalFromString("false")).toEqual("false");
  });
  
  it("can evaluate variables", function () {
    expect(evalFromString("answer")).toEqual("42");
    expect(evalFromString("double")).toEqual("<subr>");
  });
  
  it("can evaluate function abstractions", function() {
    expect(evalFromString("fun x -> x * 2")).toEqual("<closure>");
    expect(evalFromString("fun n -> fun m -> n + m")).toEqual("<closure>");
  });
  
  it("can evaluate function applications", function() {
    expect(evalFromString("double 2")).toEqual("4");
    expect(evalFromString("1 + 2 * 3")).toEqual("7");
    expect(evalFromString("(1 + 2) * 3")).toEqual("9");
  });
  
  it("can evaluate let expressions", function() {
    expect(evalFromString("let x = 1")).toEqual("1");
    expect(evalFromString("x")).toEqual("1");
  });
  
  it("can evaluate let-rec expressions", function() {
    expect(evalFromString("let rec f = fun x -> f x")).toEqual("<closure>");
    expect(evalFromString("f")).toEqual("<closure>");
  });
  
  it("can evaluate of let-tuple expressions", function() {
    expect(evalFromString("let (a, b) = (1, 2)")).toEqual("(1, 2)");
    expect(evalFromString("a")).toEqual("1");
    expect(evalFromString("b")).toEqual("2");
    expect(evalFromString("let (a, b) = (b, a)")).toEqual("(2, 1)");
    expect(evalFromString("a")).toEqual("2");
    expect(evalFromString("b")).toEqual("1");
  });
  
  it("can evaluate if expressions", function() {
    expect(evalFromString("if true then 1 else 0")).toEqual("1");
    expect(evalFromString("if false then 1 else 0")).toEqual("0");
  });
  
  it("can evaluate tuples", function() {
    expect(evalFromString("(1, true)")).toEqual("(1, true)");
    expect(evalFromString("(x, false, 3)")).toEqual("(1, false, 3)");
  });
  
  it("can calculate factorials", function () {
    var fac = "let rec fac = fun n -> if n = 0 then 1 else n * fac (n - 1)";
    expect(evalFromString(fac)).toEqual("<closure>");
    expect(evalFromString("fac 10")).toEqual("3628800");
  });
  
  it("can define variant types", function() {
    var num = "type num = Zero of unit | Pos of int | Neg of int";
    expect(evalFromString(num)).toEqual("()");
    expect(evalFromString("Zero ()")).toEqual("(Zero ())");
    expect(evalFromString("Pos (1 + 2)")).toEqual("(Pos 3)");
    expect(evalFromString("Neg (2 * 3)")).toEqual("(Neg 6)");
    var num2 = "type num2 = Num2 of num * num";
    expect(evalFromString(num2)).toEqual("()");
    expect(evalFromString("Num2 (Zero (), Pos 2)")).toEqual(
      "(Num2 ((Zero ()), (Pos 2)))"
    );
  });
  
  it("can infer types of case expressions", function () {
    expect(evalFromString("let n = Zero ()")).toEqual("(Zero ())");
    var string = "case n of ";
    string += "Zero -> fun _ -> 0 | ";
    string += "Pos -> fun _ -> 1 | ";
    string += "Neg -> fun _ -> 0 - 1";
    expect(evalFromString(string)).toEqual("0");
    var string2 = "case n of ";
    string2 += "Zero -> fun _ -> false | ";
    string2 += "else -> fun _ -> true";
    expect(evalFromString(string2)).toEqual("false");
  });
  
  it("can evaluate case expressions in functions", function () {
    var string = "let num_to_int = fun n -> case n of ";
    string += "Zero -> fun _ -> 0 | ";
    string += "Pos -> fun i -> i | ";
    string += "Neg -> fun i -> 0 - i";
    expect(evalFromString(string)).toEqual("<closure>");
    expect(evalFromString("num_to_int (Zero ())")).toEqual("0");
    expect(evalFromString("num_to_int (Pos 123)")).toEqual("123");
    expect(evalFromString("num_to_int (Neg 123)")).toEqual("-123");
  });
  
  it("can define natural numbers", function () {
    expect(evalFromString("type nat = Zero of unit | Succ of nat")).toEqual("()");
    expect(evalFromString("let zero = Zero ()")).toEqual("(Zero ())");
    expect(evalFromString("let one = Succ zero")).toEqual("(Succ (Zero ()))");
    expect(evalFromString("let two = Succ one")).toEqual("(Succ (Succ (Zero ())))");
    var string = "let rec add = fun m -> fun n -> ";
    string += "case m of ";
    string += "Zero -> fun _ -> n | ";
    string += "Succ -> fun k -> Succ (add k n)";
    expect(evalFromString(string)).toEqual("<closure>");
    expect(evalFromString("add one")).toEqual("<closure>");
    expect(evalFromString("add one two")).toEqual("(Succ (Succ (Succ (Zero ()))))");
  });
  
  it("can calculate integer division", function () {
    expect(evalFromString("5 / 2")).toEqual("2");
    expect(evalFromString("5 mod 2")).toEqual("1");
  });
  
  function evalFromString(string) {
    var parser = Parser.ofString(string);
    var expr = Parser.parse(parser);
    return Eva.eval(valueEnv, expr).toString();
  }
});
