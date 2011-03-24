Ibis.Inferer = (function () {
  var Type = Ibis.Type;
  var Env = Ibis.Env;
  var IbisError = Ibis.IbisError;
  
  var exports = function () {
    return {
      infer: polyInfer
    };
  };
  
  function polyInfer(ctxt, env, expr) {
    var freeVars = [];
    var inferredType = infer(ctxt, env, expr);
    var unwrappedType = unwrapVar(inferredType, freeVars);
    return Type.createTypeSchema(freeVars, unwrappedType);
  }
  
  function infer(ctxt, env, expr) {
    switch (expr.tag) {
    case "Const":
      switch (expr.value.tag) {
      case "Unit":
        return Type.Unit;
      case "Int":
        return Type.Int;
      case "True":
      case "False":
        return Type.Bool;
      }
    case "Var":
      var typeSchema = Env.find(ctxt, expr.varName);
      if (!typeSchema) {
        throw new IbisError("undefined variable: " + expr.varName);
      }
      return createAlphaEquivalent(typeSchema).bodyType;
    case "Abs":
      var paramType = Type.createVar(null);
      var newCtxt = Env.createLocal({}, ctxt);
      Env.add(newCtxt, expr.varName, Type.createTypeSchema([], paramType));
      var retType = infer(newCtxt, env, expr.bodyExpr);
      return Type.createFun(paramType, retType);
    case "App":
      var funType = infer(ctxt, env, expr.funExpr);
      var argType = infer(ctxt, env, expr.argExpr);
      var retType = Type.createVar(null);
      unify(funType, Type.createFun(argType, retType));
      return retType;
    case "Let":
      var inferredType = infer(ctxt, env, expr.valueExpr);
      var typeSchema = createPolyType(inferredType);
      Env.add(ctxt, expr.varName, typeSchema);
      return createAlphaEquivalent(typeSchema).bodyType;
    case "LetRec":
      var varType = Type.createVar(null);
      var newCtxt = Env.createLocal({}, ctxt);
      Env.add(newCtxt, expr.varName, Type.createTypeSchema([], varType));
      var inferredType = infer(newCtxt, env, expr.valueExpr);
      var typeSchema = createPolyType(inferredType);
      Env.add(ctxt, expr.varName, typeSchema);
      return createAlphaEquivalent(typeSchema).bodyType;
    case "LetTuple":
      var inferredType = infer(ctxt, env, expr.valueExpr);
      if (inferredType.tag != "Tuple") {
        throw new IbisError("tuple required, but got: " + inferredType);
      }
      var varNames = expr.varNames;
      var inferredTypeArray = inferredType.typeArray;
      if (inferredTypeArray.length != varNames.length) {
        throw new IbisError(varNames.length + "-tuple required, but got: " + inferredType);
      }
      var newTypeArray = [];
      for (var i in varNames) {
        var typeSchema = createPolyType(inferredTypeArray[i]);
        Env.add(ctxt, varNames[i], typeSchema);
        newTypeArray.push(createAlphaEquivalent(typeSchema).bodyType);
      }
      return Type.createTuple(newTypeArray);
    case "If":
      unify(infer(ctxt, env, expr.condExpr), Type.Bool);
      var thenType = infer(ctxt, env, expr.thenExpr);
      var elseType = infer(ctxt, env, expr.elseExpr);
      unify(thenType, elseType);
      return thenType;
    case "Tuple":
      var exprArray = expr.exprArray;
      var typeArray = [];
      for (var i in exprArray) {
        typeArray.push(infer(ctxt, env, exprArray[i]));
      }
      return Type.createTuple(typeArray);
    case "VariantDef":
      var map = {};
      var typeName = expr.typeName;
      var typeCtors = expr.typeCtors;
      for (var ctorName in typeCtors) {
        var typeExpr = typeCtors[ctorName];
        map[ctorName] = eval(env, typeExpr);
      }
      var variantType = Type.createVariant(typeName, map);
      Env.add(env, typeName, variantType);
      return Type.Unit;
    }
  }
  
  function eval(env, typeExpr) {
    switch (typeExpr.tag) {
    case "TypeVar":
      var type = Env.find(env, typeExpr.varName);
      if (!type) {
        throw new IbisError("undefined type: " + typeExpr.varName);
      }
      return type;
    case "TypeMul":
      var exprArray = typeExpr.exprArray;
      var typeArray = [];
      for (var i in exprArray) {
        typeArray.push(eval(env, exprArray[i]));
      }
      return Type.createTuple(typeArray);
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
    } else if (type1.tag == "Tuple" && type2.tag == "Tuple") {
      var typeArray1 = type1.typeArray;
      var typeArray2 = type2.typeArray;
      if (typeArray1.length != typeArray2.length) {
        throw new IbisError("unification error: " + type1 + " and " + type2);
      }
      for (var i in typeArray1) {
        unify(typeArray1[i], typeArray2[i]);
      }
    } else {
      throw new IbisError("unification error: " + type1 + " and " + type2);
    }
  }
  
  function occurIn(type, typeVar) {
    switch (type.tag) {
    case "Int":
    case "Bool":
    case "Unit":
    case "Variant":
      return false;
    case "Fun":
      return occurIn(type.paramType, typeVar) || occurIn(type.retType, typeVar);
    case "Tuple":
      return type.any(function (elem) { return occurIn(elem, typeVar) });
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
  
  function unwrapVar(type, freeVars) {
    switch (type.tag) {
    case "Int":
    case "Bool":
    case "Unit":
    case "Variant":
      return type;
    case "Fun":
      return Type.createFun(
        unwrapVar(type.paramType, freeVars),
        unwrapVar(type.retType, freeVars)
      );
    case "Tuple":
      return type.collect(function (elem) { return unwrapVar(elem, freeVars) });
    case "Var":
      if (!type.value) {
        for (var i in freeVars) {
          if (freeVars[i] == type) {
            return type;
          }
        }
        freeVars.push(type);
        return type;
      }
      return unwrapVar(type.value, freeVars);
    }
  }
  
  function createAlphaEquivalent(typeSchema) {
    var map = {};
    var oldTypeVars = typeSchema.typeVars;
    var newTypeVars = []
    for (var i in oldTypeVars) {
      var freshVar = Type.createVar(null);
      map[oldTypeVars[i]] = freshVar;
      newTypeVars.push(freshVar);
    }
    var newBodyType = Type.subst(typeSchema.bodyType, map);
    return Type.createTypeSchema(newTypeVars, newBodyType);
  }
  
  function createPolyType(type) {
    var freeVars = [];
    var unwrappedType = unwrapVar(type, freeVars);
    return Type.createTypeSchema(freeVars, unwrappedType);
  }
  
  return exports();
})();
