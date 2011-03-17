function ValueClosure(varName, expr) {
  this.varName = varName;
  this.expr = expr;
}
ValueClosure.prototype = {
  call: function (arg, env) {
    var newEnv = new EnvLocal(env);
    newEnv.add(this.varName, arg);
    return this.expr.eval(newEnv);
  },
  toString: function () {
    return "#<closure>"
  }
}
