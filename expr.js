function ExprConst(value) {
  this.value = value;
}
ExprConst.prototype = {
  eval: function (env) {
    return this.value;
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
  }
}

function ExprAbs(varName, expr) {
  this.varName = varName;
  this.expr = expr;
}
ExprAbs.prototype = {
  eval: function (env) {
    return new ValueClosure(this.varName, this.expr);
  }
}

function ExprAdd(lhs, rhs) {
  this.lhs = lhs;
  this.rhs = rhs;
}
ExprAdd.prototype = {
  eval: function (env) {
    return this.lhs.eval() + this.rhs.eval();
  }
}

function ExprSub(lhs, rhs) {
  this.lhs = lhs;
  this.rhs = rhs;
}
ExprSub.prototype = {
  eval: function (env) {
    return this.lhs.eval() - this.rhs.eval();
  }
}

function ExprMul(lhs, rhs) {
  this.lhs = lhs;
  this.rhs = rhs;
}
ExprMul.prototype = {
  eval: function (env) {
    return this.lhs.eval() * this.rhs.eval();
  }
}

function ExprDiv(lhs, rhs) {
  this.lhs = lhs;
  this.rhs = rhs;
}
ExprDiv.prototype = {
  eval: function (env) {
    return this.lhs.eval() / this.rhs.eval();
  }
}
