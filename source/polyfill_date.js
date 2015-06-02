(function (_window) {
  _window.Date.now || (_window.Date.now = function () {
    return +new Date;
  });
})(window);
