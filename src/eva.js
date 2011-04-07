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
      return Env.find(env, expr.varName);
    case "Abs":
      return Value.createClosure(env, expr.varName.varName, expr.bodyExpr);
    case "App":
      var fun = eval(env, expr.funExpr);
      var arg = eval(env, expr.argExpr);
      return apply(fun, arg);
    case "Let":
      var value = eval(env, expr.valueExpr);
      Env.add(env, expr.varName, value);
      return value;
    case "LetRec":
      var value = eval(env, expr.valueExpr);
      Env.add(env, expr.varName.varName, value);
      return value;
    case "LetTuple":
      var value = eval(env, expr.valueExpr);
      var varNames = expr.varNames;
      var valueArray = value.valueArray;
      for (var i = 0; i < varNames.length; i++) {
         Env.add(env, varNames[i], valueArray[i]);
      }
      return value;
    case "If":
      var cond = eval(env, expr.condExpr);
      if (cond == Value.True) {
        return eval(env, expr.thenExpr);
      } else {
        return eval(env, expr.elseExpr);
      }
    case "Tuple":
      var exprArray = expr.exprArray;
      var valueArray = [];
      for (var i = 0; i < exprArray.length; i++) {
        valueArray.push(eval(env, exprArray[i]));
      }
      return Value.createTuple(valueArray);
    case "Seq":
      eval(env, expr.currentExpr);
      return eval(env, expr.nextExpr);
    case "VariantDef":
      for (var ctorName in expr.typeCtors) {
        var ctor = createCtor(ctorName);
        Env.add(env, ctorName, ctor);
      }
      return Value.Unit;
    case "Case":
      var variant = eval(env, expr.variantExpr);
      var clauseExprs = expr.clauseExprs;
      var exactClause = clauseExprs[variant.ctorName];
      if (!exactClause) {
        var elseClause = expr.elseClause;
        return apply(eval(env, elseClause), variant);
      }
      return apply(eval(env, exactClause), variant.value);
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
    }
  }
  
  function createCtor(ctorName) {
    return Value.createSubr(function (value) {
      return Value.createVariant(ctorName, value);
    });
  }
  
  return exports();
})();
