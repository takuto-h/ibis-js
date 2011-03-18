function Lexer(stream) {
  this.stream = stream;
  this.token = null;
  this.value = null;
}

Lexer.prototype = (function () {
  var publicMethods = {
    advance: function () {
      var that = this;
      skipWhiteSpace(that);
      var c = that.stream.peek();
      if (c == "") {
        return false;
      } else if (c.match(/[+*\/()]/)) {
        that.token = that.stream.read();
      } else if (c == "-") {
        that.stream.read();
        c = that.stream.peek();
        if (c == ">") {
          that.token = "->";
          that.stream.read();
        } else {
          that.token = "-";
        }
      } else if (c.match(/\d/)) {
        lexInt(that);
      } else if (c.match(/\w/)) {
        lexIdent(that);
      } else {
        throw "unknown character: " + c;
      }
      return true;
    }
  }
  function lexInt(that) {
    var n = parseInt(that.stream.read());
    var c = that.stream.peek();
    while (c.match(/\d/)) {
      n = n * 10 + parseInt(that.stream.read());
      c = that.stream.peek();
    }
    that.token = Token.INT;
    that.value = n
  }
  function lexIdent(that) {
    var ident = that.stream.read();
    var c = that.stream.peek();
    while (c.match(/\w/)) {
      ident += that.stream.read();
      c = that.stream.peek();
    }
    if (Token.RESERVED[ident]) {
      that.token = Token.RESERVED[ident];
      return;
    }
    that.token = Token.IDENT;
    that.value = ident;
  }
  function skipWhiteSpace(that) {
    var c = that.stream.peek();
    while (c.match(/\s/)) {
      that.stream.read();
      c = that.stream.peek();
    }
  }
  return publicMethods;
})()
