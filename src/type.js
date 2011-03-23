Ibis.Type = (function () {
  var exports = function () {
    return {
      Int: Int,
      Bool: Bool,
      createFun: createFun,
      createVar: createVar,
      subst: subst,
      createTypeSchema: createTypeSchema
    };
  };
  
  var Int = {
    tag: "Int",
    toString: function () {
      return "int";
    }
  }
  
  var Bool = {
    tag: "Bool",
    toString: function () {
      return "bool";
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
  
  function subst(type, map) {
    switch (type.tag) {
    case "Int":
    case "Bool":
      return type;
    case "Fun":
      return createFun(subst(type.paramType, map), subst(type.retType, map));
    case "Var":
      if (map[type]) {
        return map[type];
      }
      if (!type.value) {
        return type;
      }
      return subst(type.value, map);
    }
  }
  
  function TypeSchema(typeVars, bodyType) {
    this.tag = "TypeSchema";
    this.typeVars = typeVars;
    this.bodyType = bodyType;
  }
  TypeSchema.prototype.toString = function () {
    if (this.typeVars.length == 0) {
      return this.bodyType.toString();
    }
    var map = {};
    var typeVars = this.typeVars;
    var charCode = "a".charCodeAt(0);
    for (var i = 0; i < typeVars.length; i++) {
      var varName = "'" + String.fromCharCode(charCode++);
      map[typeVars[i]] = varName;
    }
    return subst(this.bodyType, map).toString();
  }
  function createTypeSchema(typeVars, bodyType) {
    return new TypeSchema(typeVars, bodyType);
  }
  
  return exports();
})();
