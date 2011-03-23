describe("Parser", function() {
  var Parser = Ibis.Parser;
  
  it("can parse integers", function() {
    var parser = Parser.ofString("123");
    expect(Parser.parse(parser).toString()).toEqual("(Const 123)");
  });
  
  it("can parse variables", function() {
    var parser = Parser.ofString("abc");
    expect(Parser.parse(parser).toString()).toEqual("(Var abc)");
  });
  
  it("can parse function abstractions", function() {
    var parser = Parser.ofString("fun x -> x");
    expect(Parser.parse(parser).toString()).toEqual("(Abs x (Var x))");
  });
  
  it("can parse let expressions", function() {
    var parser = Parser.ofString("let x = 1");
    expect(Parser.parse(parser).toString()).toEqual("(Let x (Const 1))");
  });
  
  it("can parse let-rec expressions", function() {
    var parser = Parser.ofString("let rec f = fun x -> f x");
    expect(Parser.parse(parser).toString()).toEqual(
      "(LetRec f (Abs x (App (Var f) (Var x))))"
    );
  });
  
  it("can parse booleans", function() {
    var parser = Parser.ofString("true");
    expect(Parser.parse(parser).toString()).toEqual("(Const true)");
    var parser = Parser.ofString("false");
    expect(Parser.parse(parser).toString()).toEqual("(Const false)");
  });
  
  it("can parse function applications", function() {
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
