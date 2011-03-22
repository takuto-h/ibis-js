describe("Inferer", function() {
  var Inferer = Ibis.Inferer;
  var Parser = Ibis.Parser;
  var Type = Ibis.Type;
  var Env = Ibis.Env;
  
  var env = Env.createGlobal({
    "answer": Type.Int,
    "double": Type.createFun(Type.Int, Type.Int),
    "+": Type.createFun(Type.Int, Type.createFun(Type.Int, Type.Int)),
    "*": Type.createFun(Type.Int, Type.createFun(Type.Int, Type.Int))
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
  
  function inferFromString(string) {
    var parser = Parser.ofString(string);
    var expr = Parser.parse(parser);
    return Inferer.infer(env, expr).toString();
  }
});
