Ibis.Default = (function () {
  var Env = Ibis.Env;
  var Type = Ibis.Type;
  var Value = Ibis.Value;
  
  var exports = function () {
    return {
      createEnv: createEnv,
    };
  };
  
  function createEnv() {
    var typeEnv = Env.createGlobal({});
    var typeCtxt = Env.createGlobal({});
    var valueEnv = Env.createGlobal({});
    
    Env.add(typeEnv, "unit", Type.Unit);
    Env.add(typeEnv, "int", Type.Int);
    Env.add(typeEnv, "bool", Type.Bool);
    
    Env.add(typeCtxt, "+", binOpType(Type.Int, Type.Int, Type.Int));
    Env.add(valueEnv, "+", Value.createSubr(function (lhs) {
      return Value.createSubr(function (rhs) {
        return Value.createInt(lhs.intValue + rhs.intValue);
      });
    }));
    
    Env.add(typeCtxt, "-", binOpType(Type.Int, Type.Int, Type.Int));
    Env.add(valueEnv, "-", Value.createSubr(function (lhs) {
      return Value.createSubr(function (rhs) {
        return Value.createInt(lhs.intValue - rhs.intValue);
      });
    }));
    
    Env.add(typeCtxt, "*", binOpType(Type.Int, Type.Int, Type.Int));
    Env.add(valueEnv, "*", Value.createSubr(function (lhs) {
      return Value.createSubr(function (rhs) {
        return Value.createInt(lhs.intValue * rhs.intValue);
      });
    }));
    
    Env.add(typeCtxt, "/", binOpType(Type.Int, Type.Int, Type.Int));
    Env.add(valueEnv, "/", Value.createSubr(function (lhs) {
      return Value.createSubr(function (rhs) {
        return Value.createInt(lhs.intValue / rhs.intValue);
      });
    }));
    
    Env.add(typeCtxt, "=", binOpType(Type.Int, Type.Int, Type.Bool));
    Env.add(valueEnv, "=", Value.createSubr(function (lhs) {
      return Value.createSubr(function (rhs) {
        if (lhs.intValue == rhs.intValue) {
          return Value.True;
        } else {
          return Value.False;
        }
      });
    }));
    
    return {
      typeEnv: typeEnv,
      typeCtxt: typeCtxt,
      valueEnv: valueEnv
    };
  }
  
  function binOpType(lhs, rhs, ret) {
    return Type.createTypeSchema(
      [], Type.createFun(lhs, Type.createFun(rhs, ret))
    );
  }
  
  return exports();
})();
