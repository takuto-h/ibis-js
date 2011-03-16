var stack = [];

catchEvent(window, "load", setup);

function setup(event) {
  setupEvents(event);
}

function setupEvents(event) {
  catchEvent(document.getElementById("inputForm"), "submit", evalForm)
}

function evalForm(event) {
  var theEvent = event ? event : window.event;
  
  var inputArea = document.getElementById("inputArea");
  var outputArea = document.getElementById("outputArea");
  
  eval(inputArea.value);
  outputArea.value = showStack();
  inputArea.value = "";
  
  cancelEvent(theEvent);
}

function eval(str) {
  var re = /(\d+)|(\S+)/g;
  var resultArray = re.exec(str);
  while (resultArray) {
    if (resultArray[1]) {
      stack.push(parseInt(resultArray[1]));
    } else {
      switch (resultArray[2]) {
      case "pop":
        stack.pop();
        break;
      case "+":
        var n = stack.pop() + stack.pop();
        stack.push(n);
        break;
      case "*":
        var n = stack.pop() * stack.pop();
        stack.push(n);
        break;
      default:
        alert("unknown word: " + resultArray[2]);
        break;
      }
    }
    resultArray = re.exec(str);
  }
}

function showStack() {
  var result = "";
  for (var i = 0; i < stack.length; i++) {
    result = stack[i] + "\n" + result;
  }
  return result;
}
