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
});
