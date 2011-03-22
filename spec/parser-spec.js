describe("Parser", function() {
  var Parser = Ibis.Parser;
  
  it("can parse atoms", function() {
    var parser = Parser.ofString("123");
    expect(Parser.parse(parser).toString()).toEqual("(Const 123)");
    var parser = Parser.ofString("abc");
    expect(Parser.parse(parser).toString()).toEqual("(Var abc)");
    var parser = Parser.ofString("fun x -> x");
    expect(Parser.parse(parser).toString()).toEqual("(Abs x (Var x))");
    var parser = Parser.ofString("let x = 1");
    expect(Parser.parse(parser).toString()).toEqual("(Let x (Const 1))");
  });
  
  it("can parse primary expressions", function() {
    var parser = Parser.ofString("f x y");
    expect(Parser.parse(parser).toString()).toEqual(
      "(App (App (Var f) (Var x)) (Var y))"
    );
  });
  
  it("can parse binary expressions", function() {
    var parser = Parser.ofString("1 + 2 * 3");
    expect(Parser.parse(parser).toString()).toEqual(
      "(App (App (Var +) (Const 1)) (App (App (Var *) (Const 2)) (Const 3)))"
    );
    var parser = Parser.ofString("(1 + 2) * 3");
    expect(Parser.parse(parser).toString()).toEqual(
      "(App (App (Var *) (App (App (Var +) (Const 1)) (Const 2))) (Const 3))"
    );
  });
});
