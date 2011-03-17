function EnvGlobal() {
  this.vars = {};
}
EnvGlobal.prototype = {
  get: function (varName) {
    return this.vars[varName]
  },
  add: function (varName, value) {
    this.vars[varName] = value;
  }
}

function EnvLocal(outerEnv) {
  this.outerEnv = outerEnv;
  this.vars = {};
}
EnvLocal.prototype = {
  get: function (varName) {
    return this.vars[varName] || this.outerEnv.get(varName);
  },
  add: function (varName, value) {
    this.vars[varName] = value;
  }
}
