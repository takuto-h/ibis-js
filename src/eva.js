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
    }
  }
  
  function apply(fun, arg) {
    if (fun.tag == "Closure") {
      var newEnv = Env.createLocal({}, fun.env);
      Env.add(newEnv, fun.varName, arg);
      return eval(newEnv, fun.bodyExpr);
    }
    if (fun.tag == "Subr") {
      return fun.subrValue(arg);
    }
    //throw new IbisError("function required, but got: " + fun);
  }
  
  return exports();
})();
