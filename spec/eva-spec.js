describe("Eva", function() {
  var Eva = Ibis.Eva;
  var Parser = Ibis.Parser;
  var Value = Ibis.Value;
  var Env = Ibis.Env;
  
  var env = Env.createGlobal({
    "answer": Value.createInt(42),
    "double": Value.createSubr(function (n) {
      return Value.createInt(n.intValue * 2);
    }),
    "+": Value.createSubr(function (lhs) {
      return Value.createSubr(function (rhs) {
        return Value.createInt(lhs.intValue + rhs.intValue);
      });
    }),
    "-": Value.createSubr(function (lhs) {
      return Value.createSubr(function (rhs) {
        return Value.createInt(lhs.intValue - rhs.intValue);
      });
    }),
    "*": Value.createSubr(function (lhs) {
      return Value.createSubr(function (rhs) {
        return Value.createInt(lhs.intValue * rhs.intValue);
      });
    }),
    "=": Value.createSubr(function (lhs) {
      return Value.createSubr(function (rhs) {
        if (lhs.intValue == rhs.intValue) {
          return Value.True;
        } else {
          return Value.False;
        }
      });
    })
  });
  
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
  
  function evalFromString(string) {
    var parser = Parser.ofString(string);
    var expr = Parser.parse(parser);
    return Eva.eval(env, expr).toString();
  }
});
