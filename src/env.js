Ibis.Env = (function () {
  var exports = function () {
    return {
      createGlobal: createGlobal,
      createLocal: createLocal,
      find: find,
      add: add
    };
  };
  
  function createGlobal(vars) {
    return {
      tag: "Global",
      vars: vars
    }
  }
  
  function createLocal(vars, outerEnv) {
    return {
      tag: "Local",
      vars: vars,
      outerEnv: outerEnv
    }
  }
  
  function find(env, varName) {
    if (!env.vars[varName]) {
      if (env.tag == "Global") {
        return null;
      }
      return find(env.outerEnv, varName);
    }
    return env.vars[varName];
  }
  
  function add(env, varName, value) {
    env.vars[varName] = value;
  }
  
  return exports();
})();
