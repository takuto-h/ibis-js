function Parser(lexer) {
  this.lexer = lexer;
  this.headToken = null;
}

Parser.prototype = (function () {
  var publicMethods = {
    parse: function () {
      var that = this;
      lookAhead(that);
      if (that.headToken == Token.EOF) {
        return null;
      }
      return parseStmt(that);
    }
  }
  function lookAhead(that) {
    if (that.lexer.advance()) {
      that.headToken = that.lexer.token;
    } else {
      that.headToken = Token.EOF;
    }
  }
  function parseStmt(that) {
    var expr = parseExpr(that);
    switch (that.headToken) {
    case Token.EOF:
      break;
    default:
      throw expected(that, "EOF");
    }
    return expr;
  }
  function parseExpr(that) {
    var expr = parseTerm(that);
    while (that.headToken.match(/[+\-]/)) {
      switch (that.headToken) {
      case "+":
        lookAhead(that);
        expr = new ExprAdd(expr, parseTerm(that));
        break;
      case "-":
        lookAhead(that);
        expr = new ExprSub(expr, parseTerm(that));
        break;
      }
    }
    return expr;
  }
  function parseTerm(that) {
    var expr = parseFactor(that);
    while (that.headToken.match(/[*\/]/)) {
      switch (that.headToken) {
      case "*":
        lookAhead(that);
        expr = new ExprMul(expr, parseFactor(that));
        break;
      case "/":
        lookAhead(that);
        expr = new ExprDiv(expr, parseFactor(that));
        break;
      }
    }
    return expr;
  }
  function parseFactor(that) {
    var expr = parseAtom(that);
    while (that.headToken == "(") {
      lookAhead(that);
      expr = new ExprApp(expr, parseExpr(that));
      if (that.headToken != ")") {
        throw expected(that, ")");
      }
      lookAhead(that);
    }
    return expr;
  }
  function parseAtom(that) {
    var expr = null;
    switch (that.headToken) {
    case Token.INT:
      expr = parseInt(that);
      break;
    case Token.IDENT:
      expr = parseVar(that);
      break;
    case "fun":
      expr = parseAbs(that);
      break;
    case "(":
      expr = parseParen(that);
      break;
    default:
      throw unexpected(that);
    }
    return expr;
  }
  function parseInt(that) {
    var expr = new ExprConst(that.lexer.value);
    lookAhead(that);
    return expr;
  }
  function parseVar(that) {
    var expr = new ExprVar(that.lexer.value);
    lookAhead(that);
    return expr;
  }
  function parseAbs(that) {
    lookAhead(that);
    var varName = that.lexer.value;
    lookAhead(that);
    if (that.headToken != "->") {
      throw expected(that, "->");
    }
    lookAhead(that);
    var expr = parseExpr(that);
    return new ExprAbs(varName, expr);
  }
  function parseParen(that) {
    lookAhead(that);
    var expr = parseExpr(that);
    if (that.headToken != ")") {
      throw expected(that, ")");
    }
    lookAhead(that);
    return expr;
  }
  function expected(that, expectedToken) {
    return "unexpected " + that.headToken + ", expected " + expectedToken;
  }
  function unexpected(that) {
    return "unexpected " + that.headToken
  }
  return publicMethods;
})()
