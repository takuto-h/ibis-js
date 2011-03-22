Ibis.Inferer = (function () {
  var Type = Ibis.Type;
  var Env = Ibis.Env;
  var IbisError = Ibis.IbisError;
  
  var exports = {
    infer: inferExpr
  };
  
  function inferExpr(env, expr) {
    return unwrapVar(infer(env, expr));
  }
  
  function infer(env, expr) {
    switch (expr.tag) {
    case "Const":
      return Type.Int;
    case "Var":
      var type = Env.find(env, expr.varName);
      if (!type) {
        throw new IbisError("undefined variable: " + expr.varName);
      }
      return type;
    case "Abs":
      var paramType = Type.createVar(null);
      var newEnv = Env.createLocal({}, env);
      Env.add(newEnv, expr.varName, paramType);
      var retType = infer(newEnv, expr.bodyExpr);
      return Type.createFun(paramType, retType);
    case "App":
      var funType = infer(env, expr.funExpr);
      var argType = infer(env, expr.argExpr);
      var retType = Type.createVar(null);
      unify(funType, Type.createFun(argType, retType));
      return retType;
    }
  }
  
  function unify(type1, type2) {
    if (type1 == type2) {
      return;
    }
    if (type1.tag == "Var") {
      if (!type1.value) {
        if (occurIn(type2, type1)) {
          throw new IbisError("unification error: " + type1 + " and " + type2);
        }
        type1.value = type2;
      } else {
        unify(type1.value, type2);
      }
    } else if (type2.tag == "Var") {
      if (!type2.value) {
        if (occurIn(type1, type2)) {
          throw new IbisError("unification error: " + type1 + " and " + type2);
        }
        type2.value = type1;
      } else {
        unify(type2.value, type1);
      }
    } else if (type1.tag == "Fun" && type2.tag == "Fun") {
      unify(type1.paramType, type2.paramType);
      unify(type1.retType, type2.retType);
    } else {
      throw new IbisError("unification error: " + type1 + " and " + type2);
    }
  }
  
  function occurIn(type, typeVar) {
    switch (type) {
    case "Int":
      return false;
    case "Fun":
      return occurIn(type.paramType, typeVar) || occurIn(type.retType, typeVar);
    case "Var":
      if (type == typeVar) {
        return true;
      }
      if (!type.value) {
        return false;
      }
      return occurIn(type.value, typeVar);
    }
  }
  
  function unwrapVar(type) {
    switch (type.tag) {
    case "Int":
      return type;
    case "Fun":
      return Type.createFun(unwrapVar(type.paramType), unwrapVar(type.retType));
    case "Var":
      if (!type.value) {
        throw new IbisError("polymorphic expression appeared");
      }
      return unwrapVar(type.value);
    }
  }
  
  return exports;
})();
