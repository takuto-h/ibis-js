Ibis.Expr = (function () {
  var exports = function () {
    return {
      createConst: createConst,
      createVar: createVar,
      createAbs: createAbs,
      createApp: createApp,
      createLet: createLet,
      createLetRec: createLetRec,
      createLetTuple: createLetTuple,
      createIf: createIf,
      createCase: createCase,
      createTuple: createTuple,
      createSeq: createSeq,
      createTypeVar: createTypeVar,
      createTypeMul: createTypeMul,
      createTypeFun: createTypeFun,
      createVariantDef: createVariantDef
    };
  };
  
  function Const(value) {
    this.tag = "Const";
    this.value = value;
  }
  Const.prototype.toString = function () {
    return "(Const " + this.value + ")";
  }
  function createConst(value) {
    return new Const(value);
  }
  
  function Var(varName) {
    this.tag = "Var";
    this.varName = varName;
  }
  Var.prototype.toString = function () {
    return "(Var " + this.varName + ")";
  }
  function createVar(varName) {
    return new Var(varName);
  }
  
  function Abs(varName, bodyExpr) {
    this.tag = "Abs";
    this.varName = varName;
    this.bodyExpr = bodyExpr;
  }
  Abs.prototype.toString = function () {
    return "(Abs " + this.varName + " " + this.bodyExpr + ")";
  }
  function createAbs(varName, bodyExpr) {
    return new Abs(varName, bodyExpr);
  }
  
  function App(funExpr, argExpr) {
    this.tag = "App";
    this.funExpr = funExpr;
    this.argExpr = argExpr;
  }
  App.prototype.toString = function () {
    return "(App " + this.funExpr + " " + this.argExpr + ")";
  }
  function createApp(funExpr, argExpr) {
    return new App(funExpr, argExpr);
  }
  
  function Let(varName, valueExpr) {
    this.tag = "Let";
    this.varName = varName;
    this.valueExpr = valueExpr;
  }
  Let.prototype.toString = function () {
    return "(Let " + this.varName + " " + this.valueExpr + ")";
  }
  function createLet(varName, valueExpr) {
    return new Let(varName, valueExpr);
  }
  
  function LetRec(varName, valueExpr) {
    this.tag = "LetRec";
    this.varName = varName;
    this.valueExpr = valueExpr;
  }
  LetRec.prototype.toString = function () {
    return "(LetRec " + this.varName + " " + this.valueExpr + ")";
  }
  function createLetRec(varName, valueExpr) {
    return new LetRec(varName, valueExpr);
  }
  
  function LetTuple(varNames, valueExpr) {
    this.tag = "LetTuple";
    this.varNames = varNames;
    this.valueExpr = valueExpr;
  }
  LetTuple.prototype.toString = function () {
    return "(LetTuple (" + this.varNames.join(", ") + ") " + this.valueExpr + ")";
  }
  function createLetTuple(varNames, valueExpr) {
    return new LetTuple(varNames, valueExpr);
  }
  
  function If(condExpr, thenExpr, elseExpr) {
    this.tag = "If";
    this.condExpr = condExpr;
    this.thenExpr = thenExpr;
    this.elseExpr = elseExpr;
  }
  If.prototype.toString = function () {
    return "(If " + this.condExpr + " " + this.thenExpr + " " + this.elseExpr + ")";
  }
  function createIf(condExpr, thenExpr, elseExpr) {
    return new If(condExpr, thenExpr, elseExpr);
  }
  
  function Case(variantExpr, clauseExprs, elseClause) {
    this.tag = "Case";
    this.variantExpr = variantExpr;
    this.clauseExprs = clauseExprs;
    this.elseClause = elseClause;
  }
  Case.prototype.toString = function () {
    if (!this.elseClause) {
      return "(Case " + this.variantExpr + " "
        + showObject(this.clauseExprs) + ")";
    }
    return "(Case " + this.variantExpr + " "
      + showObject(this.clauseExprs) + " Else " + this.elseClause + ")";
  }
  function createCase(variantExpr, clauseExprs, elseClause) {
    return new Case(variantExpr, clauseExprs, elseClause);
  }
  
  function Tuple(exprArray) {
    this.tag = "Tuple";
    this.exprArray = exprArray;
  }
  Tuple.prototype.toString = function () {
    return "(Tuple " + this.exprArray.join(" ") + ")";
  }
  function createTuple(exprArray) {
    return new Tuple(exprArray);
  }
  
  function Seq(currentExpr, nextExpr) {
    this.tag = "Seq";
    this.currentExpr = currentExpr;
    this.nextExpr = nextExpr;
  }
  Seq.prototype.toString = function () {
    return "(Seq " + this.currentExpr + " " + this.nextExpr + ")";
  }
  function createSeq(currentExpr, nextExpr) {
    return new Seq(currentExpr, nextExpr);
  }
  
  function TypeVar(varName) {
    this.tag = "TypeVar";
    this.varName = varName;
  }
  TypeVar.prototype.toString = function () {
    return "(TypeVar " + this.varName + ")";
  }
  function createTypeVar(varName) {
    return new TypeVar(varName);
  }
  
  function TypeMul(exprArray) {
    this.tag = "TypeMul";
    this.exprArray = exprArray;
  }
  TypeMul.prototype.toString = function () {
    return "(TypeMul " + this.exprArray.join(" ") + ")";
  }
  function createTypeMul(exprArray) {
    return new TypeMul(exprArray);
  }
  
  function TypeFun(paramTypeExpr, retTypeExpr) {
    this.tag = "TypeFun";
    this.paramTypeExpr = paramTypeExpr;
    this.retTypeExpr = retTypeExpr;
  }
  TypeFun.prototype.toString = function () {
    return "(TypeFun " + this.paramTypeExpr + " " + this.retTypeExpr + ")";
  }
  function createTypeFun(paramTypeExpr, retTypeExpr) {
    return new TypeFun(paramTypeExpr, retTypeExpr);
  }
  
  function VariantDef(typeName, typeCtors) {
    this.tag = "VariantDef";
    this.typeName = typeName;
    this.typeCtors = typeCtors;
  }
  VariantDef.prototype.toString = function () {
    return "(VariantDef " + this.typeName + " " + showObject(this.typeCtors) + ")";
  }
  function createVariantDef(typeName, typeCtors) {
    return new VariantDef(typeName, typeCtors);
  }
  
  function showObject(object) {
    var array = [];
    for (var key in object) {
      array.push("(" + key + " " + object[key] + ")");
    }
    return array.join(" ");
  }
  
  return exports();
})();
