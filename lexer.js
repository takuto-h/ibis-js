function Lexer(stream) {
  this.stream = stream;
  this.token = null;
  this.value = null;
}

Lexer.prototype = (function () {
  var publicMethods = {
    advance: function () {
      var c = this.stream.peek();
      if (c == "") {
        return false;
      } else if (c.match(/\d/)) {
        lexInt();
      } else {
        throw "unknown character: " + c;
      }
      return true;
    }
  }
  function lexInt() {
    var n = parseInt(this.stream.read());
    var c = this.stream.peek();
    while (c.match(/\d/)) {
      n = n * 10 + parseInt(this.stream.read());
      c = this.stream.peek();
    }
    this.token = Token.INT;
    this.value = n
  }
  return publicMethods;
})()
