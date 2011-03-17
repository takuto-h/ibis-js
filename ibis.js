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
  while (lexer.advance()) {
    result += lexer.token + " ";
  }
  return result;
}
