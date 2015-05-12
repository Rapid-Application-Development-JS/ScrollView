(function (w) {
  w.performance || (w.performance = {});
  w.performance.now && (w.performance.now = performance.webkitNow || performance.mozNow || performance.msNow ||
    performance.oNow || function () {
      return Date.now()
    })
})(window);
