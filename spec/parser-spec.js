describe("Parser", function() {
  var Parser = Ibis.Parser;
  
  it("can parse atoms", function() {
    var parser = Parser.ofString("123");
    expect(Parser.parse(parser).toString()).toEqual("(Const 123)");
    var parser = Parser.ofString("abc");
    expect(Parser.parse(parser).toString()).toEqual("(Var abc)");
    var parser = Parser.ofString("fun x -> x");
    expect(Parser.parse(parser).toString()).toEqual("(Abs x (Var x))");
  });
  
  it("can parse primary expressions", function() {
    var parser = Parser.ofString("f x y");
    expect(Parser.parse(parser).toString()).toEqual("(App (App (Var f) (Var x)) (Var y))");
  });
});
