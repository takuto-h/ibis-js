Ibis.Inferer = (function () {
  var Type = Ibis.Type;
  var Env = Ibis.Env;
  var IbisError = Ibis.IbisError;
  
  var exports = function () {
    return {
      infer: polyInfer
    };
  };
  
  function polyInfer(ctxt, env, variants, visual, expr) {
    snapshot(visual);
    var inferredType = infer(ctxt, env, variants, visual, expr);
    return createPolyType(inferredType);
  }
  
  function infer(ctxt, env, variants, visual, expr) {
    var type = infer2(ctxt, env, variants, visual, expr);
    if (expr.tag != "App" && expr.tag != "Case") {
      expr.type = type;
      snapshot(visual);
    }
    return type;
  }
  
  function infer2(ctxt, env, variants, visual, expr) {
    switch (expr.tag) {
    case "Const":
      switch (expr.value.tag) {
      case "Unit":
        return Type.Unit;
      case "Int":
        return Type.Int;
      case "String":
        return Type.String;
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
      expr.varName.type = paramType;
      snapshot(visual);
      var newCtxt = Env.createLocal({}, ctxt);
      Env.add(newCtxt, expr.varName.varName, Type.createTypeSchema([], paramType));
      var retType = infer(newCtxt, env, variants, visual, expr.bodyExpr);
      return Type.createFun(paramType, retType);
    case "App":
      var funType = infer(ctxt, env, variants, visual, expr.funExpr);
      var argType = infer(ctxt, env, variants, visual, expr.argExpr);
      var retType = Type.createVar(null);
      expr.type = retType;
      snapshot(visual);
      unify(visual, funType, Type.createFun(argType, retType));
      return retType;
    case "Let":
      var inferredType = infer(ctxt, env, variants, visual, expr.valueExpr);
      var typeSchema = createPolyType(inferredType);
      Env.add(ctxt, expr.varName, typeSchema);
      return createAlphaEquivalent(typeSchema).bodyType;
    case "LetRec":
      var varType = Type.createVar(null);
      expr.varName.type = varType;
      snapshot(visual);
      var newCtxt = Env.createLocal({}, ctxt);
      Env.add(newCtxt, expr.varName.varName, Type.createTypeSchema([], varType));
      var inferredType = infer(newCtxt, env, variants, visual, expr.valueExpr);
      unify(visual, varType, inferredType);
      var typeSchema = createPolyType(inferredType);
      Env.add(ctxt, expr.varName.varName, typeSchema);
      return createAlphaEquivalent(typeSchema).bodyType;
    case "LetTuple":
      var inferredType = infer(ctxt, env, variants, visual, expr.valueExpr);
      if (inferredType.tag != "Tuple") {
        throw new IbisError("tuple required, but got: " + inferredType);
      }
      var varNames = expr.varNames;
      var inferredTypeArray = inferredType.typeArray;
      if (inferredTypeArray.length != varNames.length) {
        throw new IbisError(varNames.length + "-tuple required, but got: " + inferredType);
      }
      var newTypeArray = [];
      for (var i = 0; i < varNames.length; i++) {
        var typeSchema = createPolyType(inferredTypeArray[i]);
        Env.add(ctxt, varNames[i], typeSchema);
        newTypeArray.push(createAlphaEquivalent(typeSchema).bodyType);
      }
      return Type.createTuple(newTypeArray);
    case "If":
      unify(visual, infer(ctxt, env, variants, visual, expr.condExpr), Type.Bool);
      var thenType = infer(ctxt, env, variants, visual, expr.thenExpr);
      var elseType = infer(ctxt, env, variants, visual, expr.elseExpr);
      unify(visual, thenType, elseType);
      return thenType;
    case "Tuple":
      var exprArray = expr.exprArray;
      var typeArray = [];
      for (var i = 0; i < exprArray.length; i++) {
        typeArray.push(infer(ctxt, env, variants, visual, exprArray[i]));
      }
      return Type.createTuple(typeArray);
    case "Seq":
      infer(ctxt, env, variants, visual, expr.currentExpr);
      return infer(ctxt, env, variants, visual, expr.nextExpr);
    case "VariantDef":
      var typeName = expr.typeName;
      var paramTypeExprs = expr.typeCtors;
      var paramTypes = {};
      var variantType = Type.createVariant(typeName, paramTypes);
      Env.add(env, typeName, variantType);
      for (var ctorName in paramTypeExprs) {
        var typeExpr = paramTypeExprs[ctorName];
        var paramType = eval(env, typeExpr);
        paramTypes[ctorName] = paramType;
        var ctorType = Type.createFun(paramType, variantType);
        Env.add(ctxt, ctorName, Type.createTypeSchema([], ctorType));
        Env.add(variants, ctorName, variantType);
      }
      return Type.Unit;
    case "Case":
      var inferredType = infer(ctxt, env, variants, visual, expr.variantExpr);
      var clauseExprs = expr.clauseExprs;
      var elseClause = expr.elseClause;
      var variantType = null;
      for (var ctorName in clauseExprs) {
        variantType = Env.find(variants, ctorName);
        if (!variantType) {
          throw new IbisError("undefined constructor: " + ctorName);
        }
        break;
      }
      unify(visual, inferredType, variantType);
      var typeCtors = variantType.typeCtors;
      var resultType = Type.createVar(null);
      expr.type = resultType;
      snapshot(visual);
      if (!elseClause) {
        for (var ctorName in typeCtors) {
          if (!clauseExprs[ctorName]) {
            throw new IbisError("pattern not found: " + ctorName);
          }
        }
      } else {
        var clauseType = infer(ctxt, env, variants, visual, elseClause);
        unify(visual, clauseType, Type.createFun(variantType, resultType));
      }
      for (var ctorName in clauseExprs) {
        var clauseType = infer(ctxt, env, variants, visual, clauseExprs[ctorName]);
        if (!typeCtors[ctorName]) {
          throw new IbisError("undefined constructor: " + ctorName);
        }
        unify(visual, clauseType, Type.createFun(typeCtors[ctorName], resultType));
      }
      return resultType;
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
      for (var i = 0; i < exprArray.length; i++) {
        typeArray.push(eval(env, exprArray[i]));
      }
      return Type.createTuple(typeArray);
    case "TypeFun":
      var paramType = eval(env, typeExpr.paramTypeExpr);
      var retType = eval(env, typeExpr.retTypeExpr);
      return Type.createFun(paramType, retType);
    }
  }
  
  function unify(visual, type1, type2) {
    if (type1 == type2) {
      return;
    }
    if (type1.tag == "Var" && type2.tag == "Var") {
      if (type1.value) {
        unify(visual, type1.value, type2);
      } else if (type2.value) {
        unify(visual, type1, type2.value);
      } else {
        type1.value = type2;
        snapshot(visual);
      }
    } else if (type1.tag == "Var") {
      if (type1.value) {
        unify(visual, type1.value, type2);
      } else {
        if (occurIn(type2, type1)) {
          throw new IbisError("unification error: " + type1 + " and " + type2);
        }
        type1.value = type2;
        snapshot(visual);
      }
    } else if (type2.tag == "Var") {
      if (type2.value) {
        unify(visual, type2.value, type1);
      } else {
        if (occurIn(type1, type2)) {
          throw new IbisError("unification error: " + type1 + " and " + type2);
        }
        type2.value = type1;
        snapshot(visual);
      }
    } else if (type1.tag == "Fun" && type2.tag == "Fun") {
      unify(visual, type1.paramType, type2.paramType);
      unify(visual, type1.retType, type2.retType);
    } else if (type1.tag == "Tuple" && type2.tag == "Tuple") {
      var typeArray1 = type1.typeArray;
      var typeArray2 = type2.typeArray;
      if (typeArray1.length != typeArray2.length) {
        throw new IbisError("unification error: " + type1 + " and " + type2);
      }
      for (var i = 0; i < typeArray1.length; i++) {
        unify(visual, typeArray1[i], typeArray2[i]);
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
    case "String":
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
    case "String":
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
        for (var i = 0; i < freeVars.length; i++) {
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
    for (var i = 0; i < oldTypeVars.length; i++) {
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
  
  function show(expr) {
    var result = "";
    switch (expr.tag) {
    case "Const":
    case "Var":
    case "VariantDef":
      result += expr + showType(expr) + "\n";
      break;
    case "Abs":
      result += "Abs" + showType(expr) + "\n";
      result += indent(expr.varName);
      result += indent(expr.bodyExpr);
      break;
    case "App":
      result += "App" + showType(expr) + "\n";
      result += indent(expr.funExpr);
      result += indent(expr.argExpr);
      break;
    case "Let":
      result += "Let " + expr.varName + showType(expr) + "\n";
      result += indent(expr.valueExpr);
      break;
    case "LetRec":
      result += "LetRec" + showType(expr) + "\n";
      result += indent(expr.varName);
      result += indent(expr.valueExpr);
      break;
    case "LetTuple":
      result += "LetTuple (" + expr.varNames.join(", ") + ")" + showType(expr) + "\n"
      result += indent(expr.valueExpr);
      break;
    case "If":
      result += "If" + showType(expr) + "\n"
      result += indent(expr.condExpr);
      result += indent(expr.thenExpr);
      result += indent(expr.elseExpr);
      break;
    case "Tuple":
      result += "Tuple" + showType(expr) + "\n";
      for (var i = 0; i < expr.exprArray.length; i++) {
        result += indent(expr.exprArray[i]);
      }
      break;
    case "Seq":
      result += "Seq" + showType(expr) + "\n";
      result += indent(expr.currentExpr);
      result += indent(expr.nextExpr);
      break;
    case "Case":
      result += "Case" + showType(expr) + "\n";
      result += indent(expr.variantExpr);
      for (var ctorName in expr.clauseExprs) {
        result += indent(expr.clauseExprs[ctorName]);
      }
      if (expr.elseClause) {
        result += indent(expr.elseClause);
      }
      break;
    }
    return result;
  }
  
  function showType(expr) {
    var type = expr.type;
    if (!type) {
      return "";
    }
    return " : " + type;
  }
  
  function indent(expr) {
    var result = show(expr);
    result = result.replace(/^/mg, "  ").replace(/  $/, "");
    return result;
  }
  
  function snapshot(visual) {
    visual.slides.push(show(visual.root));
  }
  
  return exports();
})();
