function ValueClosure(varName, expr, env) {
  this.varName = varName;
  this.expr = expr;
  this.env = env;
}
ValueClosure.prototype = {
  call: function (arg, env) {
    var newEnv = new EnvLocal(this.env);
    newEnv.add(this.varName, arg);
    return this.expr.eval(newEnv);
  },
  toString: function () {
    return "#<closure>"
  }
}
