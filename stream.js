function Stream(str) {
  this.rawString = str;
  this.index = 0;
}

Stream.prototype = {
  peek: function () {
    return this.rawString.charAt(this.index);
  },
  read: function () {
    return this.rawString.charAt(this.index++);
  }
}
