function Parser(lexer) {
  this.lexer = lexer;
  this.headToken = null;
}

Parser.prototype = (function () {
  var publicMethods = {
    parse: function () {
      var self = this;
      lookAhead(self);
      if (self.headToken == Token.EOF) {
        return null;
      }
      return parseStmt(self);
    }
  }
  function lookAhead(self) {
    if (self.lexer.advance()) {
      self.headToken = self.lexer.token;
    } else {
      self.headToken = Token.EOF;
    }
  }
  function parseStmt(self) {
    var expr = parseExpr(self);
    switch (self.headToken) {
    case Token.EOF:
      break;
    default:
      throw expected(self, "EOF");
    }
    return expr;
  }
  function parseExpr(self) {
    var expr = parseTerm(self);
    while (self.headToken.match(/[+\-]/)) {
      switch (self.headToken) {
      case "+":
        lookAhead(self);
        expr = new ExprAdd(expr, parseTerm(self));
        break;
      case "-":
        lookAhead(self);
        expr = new ExprSub(expr, parseTerm(self));
        break;
      }
    }
    return expr;
  }
  function parseTerm(self) {
    var expr = parseFactor(self);
    while (self.headToken.match(/[*\/]/)) {
      switch (self.headToken) {
      case "*":
        lookAhead(self);
        expr = new ExprMul(expr, parseFactor(self));
        break;
      case "/":
        lookAhead(self);
        expr = new ExprDiv(expr, parseFactor(self));
        break;
      }
    }
    return expr;
  }
  function parseFactor(self) {
    return parseAtom(self);
  }
  function parseAtom(self) {
    var expr = null;
    switch (self.headToken) {
    case Token.INT:
      expr = new ExprConst(parseInt(self));
      break;
    default:
      throw unexpected(self);
    }
    return expr;
  }
  function parseInt(self) {
    var expr = self.lexer.value;
    lookAhead(self);
    return expr;
  }
  function expected(self, expectedToken) {
    return "unexpected " + self.headToken + ", expected " + expectedToken;
  }
  function unexpected(self) {
    return "unexpected " + self.headToken
  }
  return publicMethods;
})()
