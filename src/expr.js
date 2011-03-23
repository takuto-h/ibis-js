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
      createTuple: createTuple
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
  
  return exports();
})();
