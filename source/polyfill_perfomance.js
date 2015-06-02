(function (_window) {
  _window.performance || (_window.performance = {});
  _window.performance.now && (_window.performance.now = performance.webkitNow || performance.mozNow || performance.msNow ||
    performance.oNow || function () {
      return Date.now()
    })
})(window);
