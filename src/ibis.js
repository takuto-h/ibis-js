var Ibis = (function () {
  var exports = {
    IbisError: IbisError
  };
  
  function IbisError(message) {
    this.message = message;
  }
  IbisError.prototype = new Error();
  IbisError.prototype.constructor = IbisError;
  IbisError.prototype.name = "IbisError";
  
  return exports;
})();
