function ValueClosure(varName, expr) {
  this.varName = varName;
  this.expr = expr;
}
ValueClosure.prototype = {
  toString: function () {
    return "#<closure>"
  }
}
