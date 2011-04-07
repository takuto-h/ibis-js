Ibis.Lexer = (function () {
  var Stream = Ibis.Stream;
  var IbisError = Ibis.IbisError;
  
  var exports = function () {
    return {
      ofString: ofString,
      advance: advance,
      token: token,
      value: value
    };
  }
  
  var RESERVED = {
    "fun": "fun",
    "let": "let",
    "rec": "rec",
    "if": "if",
    "then": "then",
    "else": "else",
    "true": "true",
    "false": "false",
    "type": "type",
    "of": "of",
    "case": "case",
    "mod": "mod"
  }
  
  function ofString(string) {
    return {
      stream: Stream.ofString(string),
      token: null,
      value: null
    };
  }
  
  function advance(lexer) {
    skipWhiteSpace(lexer);
    var c = Stream.peek(lexer.stream);
    if (c == "") {
      return false;
    } else if (c == "(") {
      Stream.junk(lexer.stream);
      c = Stream.peek(lexer.stream);
      if (c == "*") {
        skipComment(lexer);
        return advance(lexer);
      } else {
        lexer.token = "(";
        return true;
      }
    }
    lexToken(lexer);
    return true;
  }
  
  function token(lexer) {
    return lexer.token;
  }
  
  function value(lexer) {
    return lexer.value;
  }
  
  function lexToken(lexer) {
    var c = Stream.peek(lexer.stream);
    if (c.match(/[+*\/()=,|^]/)) {
      lexer.token = Stream.next(lexer.stream);
    } else if (c == "-") {
      Stream.junk(lexer.stream);
      c = Stream.peek(lexer.stream);
      if (c == ">") {
        lexer.token = "->";
        Stream.junk(lexer.stream);
      } else {
        lexer.token = "-";
      }
    } else if (c == ";") {
      Stream.junk(lexer.stream);
      c = Stream.peek(lexer.stream);
      if (c == ";") {
        lexer.token = ";;";
        Stream.junk(lexer.stream);
      } else {
        lexer.token = ";";
      }
    } else if (c == "<") {
      Stream.junk(lexer.stream);
      c = Stream.peek(lexer.stream);
      if (c == "=") {
        lexer.token = "<=";
        Stream.junk(lexer.stream);
      } else if (c == ">") {
        lexer.token = "<>";
        Stream.junk(lexer.stream);
      } else {
        lexer.token = "<";
      }
    } else if (c == ">") {
      Stream.junk(lexer.stream);
      c = Stream.peek(lexer.stream);
      if (c == "=") {
        lexer.token = ">=";
        Stream.junk(lexer.stream);
      } else {
        lexer.token = ">";
      }
    } else if (c == "\"") {
      lexString(lexer);
    } else if (c.match(/\d/)) {
      lexInt(lexer);
    } else if (c.match(/\w/)) {
      lexIdent(lexer);
    } else {
      throw new IbisError("unknown character: " + c);
    }
  }
  
  function lexInt(lexer) {
    var n = parseInt(Stream.next(lexer.stream));
    var c = Stream.peek(lexer.stream);
    while (c.match(/\d/)) {
      n = n * 10 + parseInt(Stream.next(lexer.stream));
      c = Stream.peek(lexer.stream);
    }
    lexer.token = "INT";
    lexer.value = n;
  }
  
  function lexIdent(lexer) {
    var ident = Stream.next(lexer.stream);
    var c = Stream.peek(lexer.stream);
    while (c.match(/\w/)) {
      ident += Stream.next(lexer.stream);
      c = Stream.peek(lexer.stream);
    }
    if (RESERVED[ident]) {
      lexer.token = RESERVED[ident];
      return;
    }
    lexer.token = "IDENT";
    lexer.value = ident;
  }
  
  function lexString(lexer) {
    Stream.junk(lexer.stream);
    var string = "";
    var c = Stream.peek(lexer.stream);
    while (c != "\"") {
      if (c == "") {
        throw new IbisError("EOF inside a string");
      }
      string += Stream.next(lexer.stream);
      c = Stream.peek(lexer.stream);
    }
    Stream.junk(lexer.stream);
    lexer.token = "STRING";
    lexer.value = string;
  }
  
  function skipWhiteSpace(lexer) {
    var c = Stream.peek(lexer.stream);
    while (c.match(/\s/)) {
      Stream.junk(lexer.stream);
      c = Stream.peek(lexer.stream);
    }
  }
  
  function skipComment(lexer) {
    Stream.junk(lexer.stream);
    var c = Stream.peek(lexer.stream);
    while (true) {
      switch (c) {
      case "":
        throw new IbisError("EOF inside a comment");
      case "*":
        Stream.junk(lexer.stream);
        c = Stream.peek(lexer.stream);
        if (c == ")") {
          Stream.junk(lexer.stream);
          return;
        }
        break;
      case "(":
        Stream.junk(lexer.stream);
        c = Stream.peek(lexer.stream);
        if (c == "*") {
          skipComment(lexer);
          c = Stream.peek(lexer.stream);
        }
        break;
      default:
        Stream.junk(lexer.stream);
        c = Stream.peek(lexer.stream);
        break;
      }
    }
  }
  
  return exports();
})();
