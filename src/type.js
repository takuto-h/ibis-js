Ibis.Type = (function () {
  var exports = function () {
    return {
      Int: Int,
      Bool: Bool,
      Unit: Unit,
      String: String_,
      createFun: createFun,
      createVar: createVar,
      createTuple: createTuple,
      createVariant: createVariant,
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
  
  var Unit = {
    tag: "Unit",
    toString: function () {
      return "unit";
    }
  }
  
  var String_ = {
    tag: "String",
    toString: function () {
      return "string";
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
    return "<" + this.id + (this.value ? ":" + this.value : "") + ">";
  }
  function createVar(value) {
    return new Var(currentId++, value);
  }
  
  function Tuple(typeArray) {
    this.tag = "Tuple";
    this.typeArray = typeArray;
  }
  Tuple.prototype.toString = function () {
    return "(" + this.typeArray.join(" * ") + ")";
  }
  Tuple.prototype.collect = function (func) {
    var oldTypeArray = this.typeArray;
    var newTypeArray = [];
    for (var i = 0; i < oldTypeArray.length; i++) {
      newTypeArray.push(func(oldTypeArray[i]));
    }
    return createTuple(newTypeArray);
  }
  Tuple.prototype.any = function (pred) {
    var typeArray = this.typeArray;
    for (var i = 0; i < typeArray.length; i++) {
      if (pred(typeArray[i])) {
        return true;
      }
    }
    return false;
  }
  function createTuple(typeArray) {
    return new Tuple(typeArray);
  }
  
  function Variant(typeName, typeCtors) {
    this.tag = "Variant";
    this.typeName = typeName;
    this.typeCtors = typeCtors;
  }
  Variant.prototype.toString = function () {
    return this.typeName;
  }
  function createVariant(typeName, typeCtors) {
    return new Variant(typeName, typeCtors);
  }
  
  function subst(type, map) {
    switch (type.tag) {
    case "Int":
    case "Bool":
    case "Unit":
    case "String":
    case "Variant":
      return type;
    case "Fun":
      return createFun(subst(type.paramType, map), subst(type.retType, map));
    case "Tuple":
      return type.collect(function (elem) { return subst(elem, map) });
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
