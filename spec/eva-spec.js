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
  
  function evalFromString(string) {
    var parser = Parser.ofString(string);
    var expr = Parser.parse(parser);
    return Eva.eval(valueEnv, expr).toString();
  }
});
