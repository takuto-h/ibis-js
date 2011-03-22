Ibis.Stream = (function () {
  var exports = function () {
    return {
      ofString: ofString,
      peek: peek,
      next: next,
      junk: junk
    };
  };
  
  function ofString(rawString) {
    return {
      rawString: rawString,
      index: 0
    };
  }
  
  function peek(stream) {
    return stream.rawString.charAt(stream.index);
  }
  
  function next(stream) {
    return stream.rawString.charAt(stream.index++);
  }
  
  function junk(stream) {
    stream.index++;
  }
  
  return exports();
})();
