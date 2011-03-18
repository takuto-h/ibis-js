var TypeInt = {
  toString: function () {
    return "int";
  }
}

function TypeFun(argType, retValType) {
  this.argType = argType;
  this.retValType = retValType;
}
TypeFun.prototype = {
  toString: function () {
    return "(" + argType + " -> " + retValType + ")";
  }
}
