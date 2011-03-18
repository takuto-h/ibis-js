function ExprConst(value) {
  this.value = value;
}
ExprConst.prototype = {
  eval: function (env) {
    return this.value;
  },
  infer: function (env) {
    return TypeInt;
  }
}

function ExprVar(varName) {
  this.varName = varName;
}
ExprVar.prototype = {
  eval: function (env) {
    var value = env.get(this.varName);
    if (!value) {
      throw "undefined variable: " + this.varName;
    }
    return value;
  },
  infer: function (env) {
    var type = env.get(this.varName);
    if (!type) {
      throw "undefined variable: " + this.varName;
    }
    return type;
  }
}

function ExprAbs(varName, expr) {
  this.varName = varName;
  this.expr = expr;
}
ExprAbs.prototype = {
  eval: function (env) {
    return new ValueClosure(this.varName, this.expr, env);
  },
  infer: function (env) {
    var argType = new TypeVar(null);
    var newEnv = new EnvLocal(env);
    newEnv.add(this.varName, argType);
    var retValType = this.expr.infer(newEnv);
    argType = argType.unwrapTypeVar();
    retValType = retValType.unwrapTypeVar();
    return new TypeFun(argType, retValType);
  }
}

function ExprApp(funcExpr, argExpr) {
  this.funcExpr = funcExpr;
  this.argExpr = argExpr;
}
ExprApp.prototype = {
  eval: function (env) {
    var func = this.funcExpr.eval(env);
    var arg = this.argExpr.eval(env);
    if (!func.call) {
      throw "function required, but got: " + func;
    }
    return func.call(arg, env);
  },
  infer: function (env) {
    var funcType = this.funcExpr.infer(env);
    var argType = this.argExpr.infer(env);
    if (funcType instanceof TypeVar) {
      var retValType = new TypeVar(null);
      funcType.value = new TypeFun(argType, retValType);
      return retValType;
    }
    if (!(funcType instanceof TypeFun)) {
      throw "function required, but got: " + funcType;
    }
    funcType.argType.unify(argType);
    return funcType.retValType;
  }
}

function ExprAdd(lhs, rhs) {
  this.lhs = lhs;
  this.rhs = rhs;
}
ExprAdd.prototype = {
  eval: function (env) {
    return this.lhs.eval(env) + this.rhs.eval(env);
  },
  infer: function (env) {
    this.lhs.infer(env).unify(TypeInt);
    this.rhs.infer(env).unify(TypeInt);
    return TypeInt;
  }
}

function ExprSub(lhs, rhs) {
  this.lhs = lhs;
  this.rhs = rhs;
}
ExprSub.prototype = {
  eval: function (env) {
    return this.lhs.eval(env) - this.rhs.eval(env);
  },
  infer: function (env) {
    this.lhs.infer(env).unify(TypeInt);
    this.rhs.infer(env).unify(TypeInt);
    return TypeInt;
  }
}

function ExprMul(lhs, rhs) {
  this.lhs = lhs;
  this.rhs = rhs;
}
ExprMul.prototype = {
  eval: function (env) {
    return this.lhs.eval(env) * this.rhs.eval(env);
  },
  infer: function (env) {
    this.lhs.infer(env).unify(TypeInt);
    this.rhs.infer(env).unify(TypeInt);
    return TypeInt;
  }
}

function ExprDiv(lhs, rhs) {
  this.lhs = lhs;
  this.rhs = rhs;
}
ExprDiv.prototype = {
  eval: function (env) {
    return this.lhs.eval(env) / this.rhs.eval(env);
  },
  infer: function (env) {
    this.lhs.infer(env).unify(TypeInt);
    this.rhs.infer(env).unify(TypeInt);
    return TypeInt;
  }
}
