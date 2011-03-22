describe("Lexer", function() {
  var Lexer = Ibis.Lexer;
  
  it("can lex symbols", function() {
    var lexer = Lexer.ofString("+ - * / ( ) ->");
    expect(Lexer.advance(lexer)).toBeTruthy();
    expect(Lexer.token(lexer)).toEqual("+");
    expect(Lexer.advance(lexer)).toBeTruthy();
    expect(Lexer.token(lexer)).toEqual("-");
    expect(Lexer.advance(lexer)).toBeTruthy();
    expect(Lexer.token(lexer)).toEqual("*");
    expect(Lexer.advance(lexer)).toBeTruthy();
    expect(Lexer.token(lexer)).toEqual("/");
    expect(Lexer.advance(lexer)).toBeTruthy();
    expect(Lexer.token(lexer)).toEqual("(");
    expect(Lexer.advance(lexer)).toBeTruthy();
    expect(Lexer.token(lexer)).toEqual(")");
    expect(Lexer.advance(lexer)).toBeTruthy();
    expect(Lexer.token(lexer)).toEqual("->");
    expect(Lexer.advance(lexer)).toBeFalsy();
  });
  
  it("can lex integers", function() {
    var lexer = Lexer.ofString("123 456");
    expect(Lexer.advance(lexer)).toBeTruthy();
    expect(Lexer.token(lexer)).toEqual("INT");
    expect(Lexer.value(lexer)).toEqual(123);
    expect(Lexer.advance(lexer)).toBeTruthy();
    expect(Lexer.token(lexer)).toEqual("INT");
    expect(Lexer.value(lexer)).toEqual(456);
    expect(Lexer.advance(lexer)).toBeFalsy();
  });
});
