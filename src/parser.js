Ibis.Parser = (function () {
  var Lexer = Ibis.Lexer;
  var Expr = Ibis.Expr;
  var Value = Ibis.Value;
  var IbisError = Ibis.IbisError;
  
  var exports = function () {
    return {
      ofString: ofString,
      parse: parse
    };
  };
  
  function ofString(string) {
    return {
      lexer: Lexer.ofString(string),
      headToken: null
    }
  }
  
  function parse(parser) {
    lookAhead(parser);
    if (parser.headToken == "EOF") {
      return null;
    }
    return parseStmt(parser);
  }
  
  function lookAhead(parser) {
    if (Lexer.advance(parser.lexer)) {
      parser.headToken = Lexer.token(parser.lexer);
    } else {
      parser.headToken = "EOF";
    }
  }
  
  function parseStmt(parser) {
    var expr = parseExpr(parser);
    switch (parser.headToken) {
    case "EOF":
      break;
    default:
      throw new IbisError(expected(parser, "EOF"));
    }
    return expr;
  }
  
  function parseExpr(parser) {
    return parseEqExpr(parser);
  }
  
  function parseEqExpr(parser) {
    var expr = parseRelExpr(parser);
    while (parser.headToken.match(/=/)) {
      var op = parser.headToken;
      lookAhead(parser);
      expr = createBinExpr(op, expr, parseRelExpr(parser));
    }
    return expr;
  }
  
  function parseRelExpr(parser) {
    return parseAddExpr(parser);
  }
  
  function parseAddExpr(parser) {
    var expr = parseMulExpr(parser);
    while (parser.headToken.match(/[+\-]/)) {
      var op = parser.headToken;
      lookAhead(parser);
      expr = createBinExpr(op, expr, parseMulExpr(parser));
    }
    return expr;
  }
  
  function parseMulExpr(parser) {
    var expr = parsePrimExpr(parser);
    while (parser.headToken.match(/[*\/]/)) {
      var op = parser.headToken;
      lookAhead(parser);
      expr = createBinExpr(op, expr, parsePrimExpr(parser));
    }
    return expr;
  }
  
  function parsePrimExpr(parser) {
    var expr = parseAtom(parser);
    while (parser.headToken == "INT" ||
           parser.headToken == "IDENT" ||
           parser.headToken == "fun" ||
           parser.headToken == "let" ||
           parser.headToken == "(") {
      expr = Expr.createApp(expr, parseAtom(parser));
    }
    return expr;
  }
  
  function parseAtom(parser) {
    var expr = null;
    switch (parser.headToken) {
    case "INT":
      expr = parseInt(parser);
      break;
    case "IDENT":
      expr = parseIdent(parser);
      break;
    case "fun":
      expr = parseAbs(parser);
      break;
    case "let":
      expr = parseLet(parser);
      break;
    case "true":
      expr = parseTrue(parser);
      break;
    case "false":
      expr = parseFalse(parser);
      break;
    case "if":
      expr = parseIf(parser);
      break;
    case "(":
      expr = parseParen(parser);
      break;
    default:
      throw new IbisError(unexpected(parser));
    }
    return expr;
  }
  
  function parseInt(parser) {
    var expr = Expr.createConst(Value.createInt(Lexer.value(parser.lexer)));
    lookAhead(parser);
    return expr;
  }
  
  function parseIdent(parser) {
    var expr = Expr.createVar(Lexer.value(parser.lexer));
    lookAhead(parser);
    return expr;
  }
  
  function parseAbs(parser) {
    lookAhead(parser);
    if (parser.headToken != "IDENT") {
      throw new IbisError(expected(parser, "IDENT"));
    }
    var varName = Lexer.value(parser.lexer);
    lookAhead(parser);
    if (parser.headToken != "->") {
      throw new IbisError(expected(parser, "->"));
    }
    lookAhead(parser);
    var bodyExpr = parseExpr(parser);
    return Expr.createAbs(varName, bodyExpr);
  }
  
  function parseLet(parser) {
    lookAhead(parser);
    if (parser.headToken == "rec") {
      return parseLetRec(parser);
    }
    if (parser.headToken != "IDENT") {
      throw new IbisError(expected(parser, "IDENT"));
    }
    var varName = Lexer.value(parser.lexer);
    lookAhead(parser);
    if (parser.headToken != "=") {
      throw new IbisError(expected(parser, "="));
    }
    lookAhead(parser);
    var valueExpr = parseExpr(parser);
    return Expr.createLet(varName, valueExpr);
  }
  
  function parseLetRec(parser) {
    lookAhead(parser);
    if (parser.headToken != "IDENT") {
      throw new IbisError(expected(parser, "IDENT"));
    }
    var varName = Lexer.value(parser.lexer);
    lookAhead(parser);
    if (parser.headToken != "=") {
      throw new IbisError(expected(parser, "="));
    }
    lookAhead(parser);
    if (parser.headToken != "fun") {
      throw new IbisError(expected(parser, "fun"));
    }
    var valueExpr = parseAbs(parser);
    return Expr.createLetRec(varName, valueExpr);
  }
  
  function parseTrue(parser) {
    var expr = Expr.createConst(Value.True);
    lookAhead(parser);
    return expr;
  }
  
  function parseFalse(parser) {
    var expr = Expr.createConst(Value.False);
    lookAhead(parser);
    return expr;
  }
  
  function parseIf(parser) {
    lookAhead(parser);
    var condExpr = parseExpr(parser);
    if (parser.headToken != "then") {
      throw new IbisError(expected(parser, "then"));
    }
    lookAhead(parser);
    var thenExpr = parseExpr(parser);
    if (parser.headToken != "else") {
      throw new IbisError(expected(parser, "else"));
    }
    lookAhead(parser);
    var elseExpr = parseExpr(parser);
    return Expr.createIf(condExpr, thenExpr, elseExpr);
  }
  
  function parseParen(parser) {
    lookAhead(parser);
    var expr = parseExpr(parser);
    if (parser.headToken == ",") {
      return parseTuple(parser, [expr]);
    }
    if (parser.headToken != ")") {
      throw new IbisError(expected(parser, ")"));
    }
    lookAhead(parser);
    return expr;
  }
  
  function parseTuple(parser, exprArray) {
    lookAhead(parser);
    exprArray.push(parseExpr(parser));
    if (parser.headToken == ",") {
      return parseTuple(parser, exprArray);
    }
    if (parser.headToken != ")") {
      throw new IbisError(expected(parser, ")"));
    }
    lookAhead(parser);
    return Expr.createTuple(exprArray);
  }
  
  function createBinExpr(op, lhs, rhs) {
    return Expr.createApp(Expr.createApp(Expr.createVar(op), lhs), rhs);
  }
  
  function expected(parser, expectedToken) {
    return "unexpected " + parser.headToken + ", expected " + expectedToken;
  }
  
  function unexpected(parser) {
    return "unexpected " + parser.headToken
  }
  
  return exports();
})();
