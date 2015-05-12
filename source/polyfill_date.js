(function (w) {
  w.Date.now || (w.Date.now = function () {
    return +new Date;
  });
})(window);
