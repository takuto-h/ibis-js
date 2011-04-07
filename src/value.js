Ibis.Value = (function () {
  var exports = function () {
    return {
      Unit: Unit,
      True: True,
      False: False,
      createInt: createInt,
      createString: createString,
      createClosure: createClosure,
      createSubr: createSubr,
      createTuple: createTuple,
      createVariant: createVariant
    };
  };
  
  var Unit = {
    tag: "Unit",
    toString: function () {
      return "()";
    }
  };
  
  var True = {
    tag: "True",
    toString: function () {
      return "true";
    }
  };
  
  var False = {
    tag: "False",
    toString: function () {
      return "false";
    }
  }
  
  function Int(intValue) {
    this.tag = "Int";
    this.intValue = intValue;
  }
  Int.prototype.toString = function () {
    return this.intValue.toString();
  }
  function createInt(intValue) {
    return new Int(intValue);
  }
  
  function String(stringValue) {
    this.tag = "String";
    this.stringValue = stringValue;
  }
  String.prototype.toString = function () {
    return "\"" + this.stringValue + "\"";
  }
  function createString(stringValue) {
    return new String(stringValue);
  }
  
  function Closure(env, varName, bodyExpr) {
    this.tag = "Closure";
    this.env = env;
    this.varName = varName;
    this.bodyExpr = bodyExpr;
  }
  Closure.prototype.toString = function () {
    return "<closure>";
  }
  function createClosure(env, varName, bodyExpr) {
    return new Closure(env, varName, bodyExpr);
  }
  
  function Subr(subrValue) {
    this.tag = "Subr";
    this.subrValue = subrValue;
  }
  Subr.prototype.toString = function () {
    return "<subr>";
  }
  function createSubr(subrValue) {
    return new Subr(subrValue);
  }
  
  function Tuple(valueArray) {
    this.tag = "Tuple";
    this.valueArray = valueArray;
  }
  Tuple.prototype.toString = function () {
    return "(" + this.valueArray.join(", ") + ")";
  }
  function createTuple(valueArray) {
    return new Tuple(valueArray);
  }
  
  function Variant(ctorName, value) {
    this.tag = "Variant";
    this.ctorName = ctorName;
    this.value = value;
  }
  Variant.prototype.toString = function () {
    return "(" + this.ctorName + " " + this.value + ")";
  }
  function createVariant(ctorName, value) {
    return new Variant(ctorName, value);
  }
  
  return exports();
})();
