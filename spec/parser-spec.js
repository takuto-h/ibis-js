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
  
  it("can parse let-tuple expressions", function() {
    var parser = Parser.ofString("let (a, b) = (1, 2)");
    expect(Parser.parse(parser).toString()).toEqual(
      "(LetTuple (a, b) (Tuple (Const 1) (Const 2)))"
    );
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
  
  it("can parse if expressions", function() {
    var parser = Parser.ofString("if true then 1 else 0");
    expect(Parser.parse(parser).toString()).toEqual(
      "(If (Const true) (Const 1) (Const 0))"
    );
    var parser = Parser.ofString("if false then 1 else 0");
    expect(Parser.parse(parser).toString()).toEqual(
      "(If (Const false) (Const 1) (Const 0))"
    );
  });
  
  it("can parse tuples", function() {
    var parser = Parser.ofString("(1, true)");
    expect(Parser.parse(parser).toString()).toEqual(
      "(Tuple (Const 1) (Const true))"
    );
    var parser = Parser.ofString("(x, false, 3)");
    expect(Parser.parse(parser).toString()).toEqual(
      "(Tuple (Var x) (Const false) (Const 3))"
    );
  });
  
  it("can parse units", function() {
    var parser = Parser.ofString("()");
    expect(Parser.parse(parser).toString()).toEqual("(Const ())");
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
    var parser = Parser.ofString("x = 1");
    expect(Parser.parse(parser).toString()).toEqual(
      "(App (App (Var =) (Var x)) (Const 1))"
    );
  });
  
  it("can parse variant definitions", function() {
    var parser = Parser.ofString("type num = Zero of unit | Pos of int | Neg of int");
    expect(Parser.parse(parser).toString()).toEqual(
      "(VariantDef num (Zero (TypeVar unit)) (Pos (TypeVar int)) (Neg (TypeVar int)))"
    );
  });
});
