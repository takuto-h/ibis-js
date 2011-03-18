var valueEnv = new EnvGlobal();
var typeEnv = new EnvGlobal();

catchEvent(window, "load", setup);

function setup(event) {
  setupEvents(event);
  document.getElementById("outputArea").value = "> ";
}

function setupEvents(event) {
  catchEvent(document.getElementById("inputForm"), "submit", evalForm)
}

function evalForm(event) {
  var theEvent = event ? event : window.event;
  
  var inputArea = document.getElementById("inputArea");
  var outputArea = document.getElementById("outputArea");
  
  var inputStr = inputArea.value;
  outputArea.value += inputStr + "\n" + eval(inputStr) + "\n> ";
  inputArea.value = "";
  
  cancelEvent(theEvent);
}

function eval(str) {
  var result = "";
  var stream = new Stream(str);
  var lexer = new Lexer(stream);
  var parser = new Parser(lexer);
  try {
    while (true) {
      var expr = parser.parse();
      if (!expr) {
        break;
      }
      var type = expr.infer(typeEnv);
      var value = expr.eval(valueEnv);
      result += value + " : " + type  + " "
    }
  } catch (e) {
    alert(e);
  }
  return result;
}
