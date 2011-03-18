var TypeInt = {
  toString: function () {
    return "int";
  },
  unify: function (otherType) {
    if (otherType instanceof TypeVar) {
      otherType.value = this;
      return;
    }
    if (otherType != this) {
       throw "int required, but got: " + otherType;
    }
  },
  unwrapTypeVar: function () {
    return this;
  }
}

function TypeFun(argType, retValType) {
  this.argType = argType;
  this.retValType = retValType;
}
TypeFun.prototype = {
  toString: function () {
    return "(" + this.argType + " -> " + this.retValType + ")";
  },
  unify: function (otherType) {
    if (otherType instanceof TypeVar) {
      otherType.value = this;
      return;
    }
    if (!(otherType instanceof TypeFun)) {
       throw "function required, but got: " + otherType;
    }
    this.argType.unify(otherType.argType);
    this.retValType.unify(otherType.retValType);
  },
  unwrapTypeVar: function () {
    return new TypeFun(
      this.argType.unwrapTypeVar(),
      this.retValType.unwrapTypeVar()
    );
  }
}

function TypeVar(value) {
  this.value = value;
}
TypeVar.prototype = {
  toString: function () {
    return "#<tvar " + this.value + ">";
  },
  unify: function (otherType) {
    if (this.value) {
      this.value.unify(otherType);
      return;
    }
    this.value = otherType;
  },
  unwrapTypeVar: function () {
    if (!this.value) {
      throw "polymorphic expression appeared";
    }
    return this.value.unwrapTypeVar();
  }
}
