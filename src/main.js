(function () {
  var Env = Ibis.Env;
  var Parser = Ibis.Parser;
  var Inferer = Ibis.Inferer;
  var Eva = Ibis.Eva;
  var Compat = Ibis.Compat;
  
  var valueEnv = Env.createGlobal({});
  var typeEnv = Env.createGlobal({});
  
  Compat.catchEvent(window, "load", setup);
  
  function setup(event) {
    var inputForm = document.getElementById("inputForm");
    var outputArea = document.getElementById("outputArea");
    Compat.catchEvent(inputForm, "submit", interpretForm);
    outputArea.value = "> ";
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
        var type = Inferer.infer(typeEnv, expr);
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
})();
