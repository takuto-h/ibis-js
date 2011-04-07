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
    var expr = parseDef(parser);
    switch (parser.headToken) {
    case "EOF":
    case ";;":
      break;
    default:
      throw new IbisError(expected(parser, ";;"));
    }
    return expr;
  }
  
  function parseDef(parser) {
    var expr = null;
    switch (parser.headToken) {
    case "let":
      expr = parseLet(parser);
      break;
    case "type":
      expr = parseTypeDef(parser);
      break;
    default:
      expr = parseExpr(parser);
      break;
    }
    return expr;
  }
  
  function parseExpr(parser) {
    return parseCompExpr(parser);
  }
  
  function parseCompExpr(parser) {
    var expr = parseSimpleExpr(parser);
    if (parser.headToken == ";") {
      lookAhead(parser);
      expr = Expr.createSeq(expr, parseCompExpr(parser));
    }
    return expr;
  }
  
  function parseSimpleExpr(parser) {
    var expr = null;
    switch (parser.headToken) {
    case "fun":
      expr = parseAbs(parser);
      break;
    case "if":
      expr = parseIf(parser);
      break;
    case "case":
      expr = parseCase(parser);
      break;
    default:
      expr = parseLogicExpr(parser);
      break;
    }
    return expr;
  }
  
  function parseLogicExpr(parser) {
    return parseEqExpr(parser);
  }
  
  function parseEqExpr(parser) {
    var expr = parseConcatExpr(parser);
    while (parser.headToken.match(/=|<[>=]?|>=?/)) {
      var op = parser.headToken;
      lookAhead(parser);
      expr = createBinExpr(op, expr, parseConcatExpr(parser));
    }
    return expr;
  }
  
  function parseConcatExpr(parser) {
    var expr = parseAddExpr(parser);
    if (parser.headToken.match(/\^/)) {
      var op = parser.headToken;
      lookAhead(parser);
      expr = createBinExpr(op, expr, parseConcatExpr(parser));
    }
    return expr;
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
    var expr = parseUnaryExpr(parser);
    while (parser.headToken.match(/[*\/]|mod/)) {
      var op = parser.headToken;
      lookAhead(parser);
      expr = createBinExpr(op, expr, parseUnaryExpr(parser));
    }
    return expr;
  }
  
  function parseUnaryExpr(parser) {
    var expr = null;
    switch (parser.headToken) {
    case "-":
      lookAhead(parser);
      expr = Expr.createApp(Expr.createVar("(~-)"), parseUnaryExpr(parser));
      break;
    default:
      expr = parsePrimExpr(parser);
      break;
    }
    return expr;
  }
  
  function parsePrimExpr(parser) {
    var expr = parseAtom(parser);
    while (parser.headToken == "INT" ||
           parser.headToken == "IDENT" ||
           parser.headToken == "STRING" ||
           parser.headToken == "true" ||
           parser.headToken == "false" ||
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
    case "STRING":
      expr = parseString(parser);
      break;
    case "IDENT":
      expr = parseIdent(parser);
      break;
    case "true":
      expr = parseTrue(parser);
      break;
    case "false":
      expr = parseFalse(parser);
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
  
  function parseString(parser) {
    var expr = Expr.createConst(Value.createString(Lexer.value(parser.lexer)));
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
    var varName = Expr.createVar(Lexer.value(parser.lexer));
    lookAhead(parser);
    if (parser.headToken != "->") {
      throw new IbisError(expected(parser, "->"));
    }
    lookAhead(parser);
    var bodyExpr = parseSimpleExpr(parser);
    return Expr.createAbs(varName, bodyExpr);
  }
  
  function parseLet(parser) {
    lookAhead(parser);
    switch (parser.headToken) {
    case "IDENT":
      break;
    case "rec":
      return parseLetRec(parser);
    case "(":
      return parseLetTuple(parser, []);
    default:
      throw new IbisError(expected(parser, "IDENT"));
    }
    var varName = Lexer.value(parser.lexer);
    lookAhead(parser);
    if (parser.headToken != "=") {
      throw new IbisError(expected(parser, "="));
    }
    lookAhead(parser);
    var valueExpr = parseSimpleExpr(parser);
    return Expr.createLet(varName, valueExpr);
  }
  
  function parseLetRec(parser) {
    lookAhead(parser);
    if (parser.headToken != "IDENT") {
      throw new IbisError(expected(parser, "IDENT"));
    }
    var varName = Expr.createVar(Lexer.value(parser.lexer));
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
  
  function parseLetTuple(parser, varNames) {
    lookAhead(parser);
    if (parser.headToken != "IDENT") {
      throw new IbisError(expected(parser, "IDENT"));
    }
    varNames.push(Lexer.value(parser.lexer));
    lookAhead(parser);
    if (parser.headToken == ",") {
      return parseLetTuple(parser, varNames);
    }
    if (parser.headToken != ")") {
      throw new IbisError(expected(parser, ")"));
    }
    lookAhead(parser);
    if (parser.headToken != "=") {
      throw new IbisError(expected(parser, "="));
    }
    lookAhead(parser);
    var valueExpr = parseSimpleExpr(parser);
    return Expr.createLetTuple(varNames, valueExpr);
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
    var condExpr = parseSimpleExpr(parser);
    if (parser.headToken != "then") {
      throw new IbisError(expected(parser, "then"));
    }
    lookAhead(parser);
    var thenExpr = parseSimpleExpr(parser);
    if (parser.headToken != "else") {
      throw new IbisError(expected(parser, "else"));
    }
    lookAhead(parser);
    var elseExpr = parseSimpleExpr(parser);
    return Expr.createIf(condExpr, thenExpr, elseExpr);
  }
  
  function parseCase(parser) {
    lookAhead(parser);
    var variantExpr = parseSimpleExpr(parser);
    if (parser.headToken != "of") {
      throw new IbisError(expected(parser, "of"));
    }
    var clauseExprs = {};
    parseCaseClauses(parser, clauseExprs);
    var elseClause = null;
    if (parser.headToken == "else") {
      elseClause = parseElseClause(parser);
    }
    return Expr.createCase(variantExpr, clauseExprs, elseClause);
  }
  
  function parseCaseClauses(parser, clauseExprs) {
    lookAhead(parser);
    var ctorName = "";
    switch (parser.headToken) {
    case "IDENT":
      ctorName = Lexer.value(parser.lexer);
      break;
    case "else":
      return;
    default:
      throw new IbisError(expected(parser, "IDENT"));
    }
    lookAhead(parser);
    if (parser.headToken != "->") {
      throw new IbisError(expected(parser, "->"));
    }
    lookAhead(parser);
    var bodyExpr = parseSimpleExpr(parser);
    clauseExprs[ctorName] = bodyExpr;
    if (parser.headToken == "|") {
      parseCaseClauses(parser, clauseExprs);
    }
  }
  
  function parseElseClause(parser) {
    lookAhead(parser);
    if (parser.headToken != "->") {
      throw new IbisError(expected(parser, "->"));
    }
    lookAhead(parser);
    return parseSimpleExpr(parser);
  }
  
  function parseParen(parser) {
    lookAhead(parser);
    if (parser.headToken == ")") {
      return parseUnit(parser);
    }
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
  
  function parseUnit(parser) {
    var expr = Expr.createConst(Value.Unit);
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
    return Expr.createApp(Expr.createApp(Expr.createVar("(" + op + ")"), lhs), rhs);
  }
  
  function parseTypeDef(parser) {
    lookAhead(parser);
    if (parser.headToken != "IDENT") {
      throw new IbisError(expected(parser, "IDENT"));
    }
    var typeName = Lexer.value(parser.lexer);
    lookAhead(parser);
    if (parser.headToken != "=") {
      throw new IbisError(expected(parser, "("));
    }
    var typeCtors = {};
    parseTypeCtors(parser, typeCtors);
    return Expr.createVariantDef(typeName, typeCtors);
  }
  
  function parseTypeCtors(parser, map) {
    lookAhead(parser);
    if (parser.headToken != "IDENT") {
      throw new IbisError(expected(parser, "IDENT"));
    }
    var ctorName = Lexer.value(parser.lexer);
    lookAhead(parser);
    if (parser.headToken != "of") {
      throw new IbisError(expected(parser, "of"));
    }
    lookAhead(parser);
    var typeExpr = parseTypeExpr(parser);
    map[ctorName] = typeExpr;
    if (parser.headToken == "|") {
      parseTypeCtors(parser, map);
      return;
    }
  }
  
  function parseTypeExpr(parser) {
    var typeExpr = parseTypeMulExpr(parser);
    if (parser.headToken == "->") {
      lookAhead(parser);
      return Expr.createTypeFun(typeExpr, parseTypeExpr(parser));
    }
    return typeExpr;
  }
  
  function parseTypeMulExpr(parser) {
    var typeExpr = parseTypeAtom(parser);
    var typeExprArray = [typeExpr];
    while (parser.headToken == "*") {
      lookAhead(parser);
      typeExprArray.push(parseTypeAtom(parser));
    }
    if (typeExprArray.length != 1) {
      return Expr.createTypeMul(typeExprArray);
    }
    return typeExpr;
  }
  
  function parseTypeAtom(parser) {
    var typeExpr = null;
    switch (parser.headToken) {
    case "IDENT":
      typeExpr = parseTypeVar(parser);
      break;
    case "(":
      typeExpr = parseTypeParen(parser);
      break;
    default:
      throw new IbisError(unexpected(parser));
    }
    return typeExpr;
  }
  
  function parseTypeVar(parser) {
    var typeExpr = Expr.createTypeVar(Lexer.value(parser.lexer));
    lookAhead(parser);
    return typeExpr;
  }
  
  function parseTypeParen(parser) {
    lookAhead(parser);
    var expr = parseTypeExpr(parser);
    if (parser.headToken != ")") {
      throw new IbisError(expected(parser, ")"));
    }
    lookAhead(parser);
    return expr;
  }
  
  function expected(parser, expectedToken) {
    return "unexpected " + parser.headToken + ", expected " + expectedToken;
  }
  
  function unexpected(parser) {
    return "unexpected " + parser.headToken
  }
  
  return exports();
})();
