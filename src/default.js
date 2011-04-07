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
    
    Env.add(typeCtxt, "(+)", binOpType(Type.Int, Type.Int, Type.Int));
    Env.add(valueEnv, "(+)", Value.createSubr(function (lhs) {
      return Value.createSubr(function (rhs) {
        return Value.createInt(lhs.intValue + rhs.intValue);
      });
    }));
    
    Env.add(typeCtxt, "(-)", binOpType(Type.Int, Type.Int, Type.Int));
    Env.add(valueEnv, "(-)", Value.createSubr(function (lhs) {
      return Value.createSubr(function (rhs) {
        return Value.createInt(lhs.intValue - rhs.intValue);
      });
    }));
    
    Env.add(typeCtxt, "(*)", binOpType(Type.Int, Type.Int, Type.Int));
    Env.add(valueEnv, "(*)", Value.createSubr(function (lhs) {
      return Value.createSubr(function (rhs) {
        return Value.createInt(lhs.intValue * rhs.intValue);
      });
    }));
    
    Env.add(typeCtxt, "(/)", binOpType(Type.Int, Type.Int, Type.Int));
    Env.add(valueEnv, "(/)", Value.createSubr(function (lhs) {
      return Value.createSubr(function (rhs) {
        return Value.createInt(Math.floor(lhs.intValue / rhs.intValue));
      });
    }));
    
    Env.add(typeCtxt, "(mod)", binOpType(Type.Int, Type.Int, Type.Int));
    Env.add(valueEnv, "(mod)", Value.createSubr(function (lhs) {
      return Value.createSubr(function (rhs) {
        return Value.createInt(lhs.intValue % rhs.intValue);
      });
    }));
    
    Env.add(typeCtxt, "(=)", binOpType(Type.Int, Type.Int, Type.Bool));
    Env.add(valueEnv, "(=)", Value.createSubr(function (lhs) {
      return Value.createSubr(function (rhs) {
        if (lhs.intValue == rhs.intValue) {
          return Value.True;
        } else {
          return Value.False;
        }
      });
    }));
    
    Env.add(typeCtxt, "(<)", binOpType(Type.Int, Type.Int, Type.Bool));
    Env.add(valueEnv, "(<)", Value.createSubr(function (lhs) {
      return Value.createSubr(function (rhs) {
        if (lhs.intValue < rhs.intValue) {
          return Value.True;
        } else {
          return Value.False;
        }
      });
    }));
    
    Env.add(typeCtxt, "(<=)", binOpType(Type.Int, Type.Int, Type.Bool));
    Env.add(valueEnv, "(<=)", Value.createSubr(function (lhs) {
      return Value.createSubr(function (rhs) {
        if (lhs.intValue <= rhs.intValue) {
          return Value.True;
        } else {
          return Value.False;
        }
      });
    }));
    
    Env.add(typeCtxt, "(>)", binOpType(Type.Int, Type.Int, Type.Bool));
    Env.add(valueEnv, "(>)", Value.createSubr(function (lhs) {
      return Value.createSubr(function (rhs) {
        if (lhs.intValue > rhs.intValue) {
          return Value.True;
        } else {
          return Value.False;
        }
      });
    }));
    
    Env.add(typeCtxt, "(>=)", binOpType(Type.Int, Type.Int, Type.Bool));
    Env.add(valueEnv, "(>=)", Value.createSubr(function (lhs) {
      return Value.createSubr(function (rhs) {
        if (lhs.intValue >= rhs.intValue) {
          return Value.True;
        } else {
          return Value.False;
        }
      });
    }));
    
    Env.add(typeCtxt, "(<>)", binOpType(Type.Int, Type.Int, Type.Bool));
    Env.add(valueEnv, "(<>)", Value.createSubr(function (lhs) {
      return Value.createSubr(function (rhs) {
        if (lhs.intValue != rhs.intValue) {
          return Value.True;
        } else {
          return Value.False;
        }
      });
    }));
    
    Env.add(typeCtxt, "(^)", binOpType(Type.String, Type.String, Type.String));
    Env.add(valueEnv, "(^)", Value.createSubr(function (lhs) {
      return Value.createSubr(function (rhs) {
        return Value.createString(lhs.stringValue + rhs.stringValue);
      });
    }));
    
    Env.add(typeCtxt, "not", Type.createTypeSchema([], Type.createFun(Type.Bool, Type.Bool)));
    Env.add(valueEnv, "not", Value.createSubr(function (cond) {
      if (cond == Value.True) {
        return Value.False;
      } else {
        return Value.True;
      }
    }));
    
    Env.add(typeCtxt, "(~-)", Type.createTypeSchema([], Type.createFun(Type.Int, Type.Int)));
    Env.add(valueEnv, "(~-)", Value.createSubr(function (n) {
      return Value.createInt(- n.intValue);
    }));
    
    var typeVar = Type.createVar(null);
    Env.add(typeCtxt, "show", Type.createTypeSchema(
      [typeVar], Type.createFun(typeVar, Type.String)
    ));
    Env.add(valueEnv, "show", Value.createSubr(function (x) {
      return Value.createString(x.toString());
    }));
    
    var typeVar = Type.createVar(null);
    Env.add(typeCtxt, "alert", Type.createTypeSchema(
      [typeVar], Type.createFun(typeVar, typeVar)
    ));
    Env.add(valueEnv, "alert", Value.createSubr(function (x) {
      alert(x);
      return x;
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
