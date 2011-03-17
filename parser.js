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
    var expr = parseAtom(self);
    while (self.headToken == "(") {
      lookAhead(self);
      expr = new ExprApp(expr, parseExpr(self));
      if (self.headToken != ")") {
        throw expected(self, ")");
      }
      lookAhead(self);
    }
    return expr;
  }
  function parseAtom(self) {
    var expr = null;
    switch (self.headToken) {
    case Token.INT:
      expr = parseInt(self);
      break;
    case Token.IDENT:
      expr = parseVar(self);
      break;
    case "^":
      expr = parseAbs(self);
      break;
    case "(":
      expr = parseParen(self);
      break;
    default:
      throw unexpected(self);
    }
    return expr;
  }
  function parseInt(self) {
    var expr = new ExprConst(self.lexer.value);
    lookAhead(self);
    return expr;
  }
  function parseVar(self) {
    var expr = new ExprVar(self.lexer.value);
    lookAhead(self);
    return expr;
  }
  function parseAbs(self) {
    lookAhead(self);
    var varName = self.lexer.value;
    lookAhead(self);
    var expr = parseExpr(self);
    return new ExprAbs(varName, expr);
  }
  function parseParen(self) {
    lookAhead(self);
    var expr = parseExpr(self);
    if (self.headToken != ")") {
      throw expected(self, ")");
    }
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
