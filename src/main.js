(function () {
  var Env = Ibis.Env;
  var Parser = Ibis.Parser;
  var Inferer = Ibis.Inferer;
  var Eva = Ibis.Eva;
  var Type = Ibis.Type;
  var Value = Ibis.Value;
  var Compat = Ibis.Compat;
  var IbisError = Ibis.IbisError;
  
  var valueEnv = Env.createGlobal({});
  var typeCtxt = Env.createGlobal({});
  var typeEnv = Env.createGlobal({});
  
  Compat.catchEvent(window, "load", setup);
  
  function setup(event) {
    var inputForm = document.getElementById("inputForm");
    var outputArea = document.getElementById("outputArea");
    Compat.catchEvent(inputForm, "submit", interpretForm);
    Compat.catchEvent(inputForm, "submit", scrollToBottom);
    outputArea.value = "> ";
  }
  
  function scrollToBottom(event) {
    var outputArea = document.getElementById("outputArea");
    setTimeout(function () {  // for IE8
      outputArea.scrollTop = outputArea.scrollHeight - outputArea.clientHeight;
    }, 0);
  }
  
  function interpretForm(event) {
    var theEvent = event ? event : window.event;
    
    var inputArea = document.getElementById("inputArea");
    var outputArea = document.getElementById("outputArea");
    
    var inputStr = inputArea.value;
    outputArea.value += inputStr + "\n" + interpret(inputStr) + "> ";
    inputArea.value = "";
    
    Compat.cancelEvent(theEvent);
  }
  
  function interpret(string) {
    var result = "";
    var parser = Parser.ofString(string);
    try {
      while (true) {
        var expr = Parser.parse(parser);
        if (!expr) {
          break;
        }
        var type = Inferer.infer(typeCtxt, typeEnv, expr);
        var value = Eva.eval(valueEnv, expr);
        result += "- : " + type + " = " + value + "\n";
      }
    } catch (e) {
      if (e instanceof IbisError) {
        result += "ERROR: " + e.message + "\n";
      } else {
        throw e;
      }
    }
    return result;
  }
  
  function binOpType(lhs, rhs, ret) {
    return Type.createTypeSchema(
      [], Type.createFun(lhs, Type.createFun(rhs, ret))
    );
  }
  
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
})();
