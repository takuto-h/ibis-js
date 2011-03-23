Ibis.Eva = (function () {
  var Value = Ibis.Value;
  var Env = Ibis.Env;
  var IbisError = Ibis.IbisError;
  
  var exports = function () {
    return {
      eval: eval
    };
  };
  
  function eval(env, expr) {
    switch (expr.tag) {
    case "Const":
      return expr.value;
    case "Var":
      var value = Env.find(env, expr.varName);
      /*if (!value) {
        throw new IbisError("undefined variable: " + expr.varName);
      }*/
      return value;
    case "Abs":
      return Value.createClosure(env, expr.varName, expr.bodyExpr);
    case "App":
      var fun = eval(env, expr.funExpr);
      var arg = eval(env, expr.argExpr);
      return apply(fun, arg);
    case "Let":
    case "LetRec":
      var value = eval(env, expr.valueExpr);
      Env.add(env, expr.varName, value);
      return value;
    case "If":
      var cond = eval(env, expr.condExpr);
      if (cond == Value.True) {
        return eval(env, expr.thenExpr);
      } else {
        return eval(env, expr.elseExpr);
      }
    }
  }
  
  function apply(fun, arg) {
    switch (fun.tag) {
    case "Closure":
      var newEnv = Env.createLocal({}, fun.env);
      Env.add(newEnv, fun.varName, arg);
      return eval(newEnv, fun.bodyExpr);
    case "Subr":
      return fun.subrValue(arg);
    /*default:
      throw new IbisError("function required, but got: " + fun);*/
    }
  }
  
  return exports();
})();
