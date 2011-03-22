describe("Eva", function() {
  var Eva = Ibis.Eva;
  var Parser = Ibis.Parser;
  var Value = Ibis.Value;
  var Env = Ibis.Env;
  
  var env = Env.createGlobal({
    "answer": 42,
    "double": Value.createSubr(function (n) {
      return n * 2;
    }),
    "+": Value.createSubr(function (lhs) {
      return Value.createSubr(function (rhs) {
        return lhs + rhs;
      });
    }),
    "*": Value.createSubr(function (lhs) {
      return Value.createSubr(function (rhs) {
        return lhs * rhs;
      });
    })
  });
  
  it("can evaluate constants", function() {
    expect(evalFromString("123")).toEqual("123");
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
  
  function evalFromString(string) {
    var parser = Parser.ofString(string);
    var expr = Parser.parse(parser);
    return Eva.eval(env, expr).toString();
  }
});
