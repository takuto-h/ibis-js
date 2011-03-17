function catchEvent(eventObj, event, eventHandler) {
  if (eventObj.addEventListener) {
    eventObj.addEventListener(event, eventHandler, false);
  } else if (eventObj.attachEvent) {
    event = "on" + event;
    eventObj.attachEvent(event, eventHandler);
  }
}

function cancelEvent(event) {
  if (event.preventDefault) {
    event.preventDefault();
    event.stopPropagation();
  } else {
    event.returnValue = false;
    event.cancelBubble = true;
  }
}
