Ibis.Value = (function () {
  var exports = function () {
    return {
      createClosure: createClosure,
      createSubr: createSubr
    };
  };
  
  function Closure(env, varName, bodyExpr) {
    this.tag = "Closure";
    this.env = env;
    this.varName = varName;
    this.bodyExpr = bodyExpr;
  }
  Closure.prototype.toString = function () {
    return "<closure>";
  }
  function createClosure(env, varName, bodyExpr) {
    return new Closure(env, varName, bodyExpr);
  }
  
  function Subr(subrValue) {
    this.tag = "Subr";
    this.subrValue = subrValue;
  }
  Subr.prototype.toString = function () {
    return "<subr>";
  }
  function createSubr(subrValue) {
    return new Subr(subrValue);
  }
  
  return exports();
})();
