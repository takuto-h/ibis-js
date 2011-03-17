function Lexer(stream) {
  this.stream = stream;
  this.token = null;
  this.value = null;
}

Lexer.prototype = (function () {
  var publicMethods = {
    advance: function () {
      var self = this;
      skipWhiteSpace(self);
      var c = self.stream.peek();
      if (c == "") {
        return false;
      } else if (c.match(/[+\-*\/()]/)) {
        self.token = self.stream.read();
      } else if (c.match(/\d/)) {
        lexInt(this);
      } else {
        throw "unknown character: " + c;
      }
      return true;
    }
  }
  function lexInt(self) {
    var n = parseInt(self.stream.read());
    var c = self.stream.peek();
    while (c.match(/\d/)) {
      n = n * 10 + parseInt(self.stream.read());
      c = self.stream.peek();
    }
    self.token = Token.INT;
    self.value = n
  }
  function skipWhiteSpace(self) {
    var c = self.stream.peek();
    while (c.match(/\s/)) {
      self.stream.read();
      c = self.stream.peek();
    }
  }
  return publicMethods;
})()
