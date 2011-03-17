function ExprConst(value) {
  this.value = value;
}
ExprConst.prototype = {
  eval: function () {
    return this.value;
  }
}

function ExprAdd(lhs, rhs) {
  this.lhs = lhs;
  this.rhs = rhs;
}
ExprAdd.prototype = {
  eval: function () {
    return this.lhs.eval() + this.rhs.eval();
  }
}

function ExprSub(lhs, rhs) {
  this.lhs = lhs;
  this.rhs = rhs;
}
ExprSub.prototype = {
  eval: function () {
    return this.lhs.eval() - this.rhs.eval();
  }
}

function ExprMul(lhs, rhs) {
  this.lhs = lhs;
  this.rhs = rhs;
}
ExprMul.prototype = {
  eval: function () {
    return this.lhs.eval() * this.rhs.eval();
  }
}

function ExprDiv(lhs, rhs) {
  this.lhs = lhs;
  this.rhs = rhs;
}
ExprDiv.prototype = {
  eval: function () {
    return this.lhs.eval() / this.rhs.eval();
  }
}
