Ibis.Type = (function () {
  var exports = function () {
    return {
      Int: Int,
      createFun: createFun,
      createVar: createVar
    };
  };
  
  var Int = {
    tag: "Int",
    toString: function () {
      return "int";
    }
  }
  
  function Fun(paramType, retType) {
    this.tag = "Fun";
    this.paramType = paramType;
    this.retType = retType;
  }
  Fun.prototype.toString = function () {
    return "(" + this.paramType + " -> " + this.retType + ")";
  }
  function createFun(paramType, retType) {
    return new Fun(paramType, retType);
  }
  
  var currentId = 0;
  function Var(id, value) {
    this.tag = "Var";
    this.id = id;
    this.value = value;
  }
  Var.prototype.toString = function () {
    return "<" + this.id + ">";
  }
  function createVar(value) {
    return new Var(currentId++, value);
  }
  
  return exports();
})();
