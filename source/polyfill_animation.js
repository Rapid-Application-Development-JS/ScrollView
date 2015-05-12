(function (w) {
  var lastTime = 0;
  var vendors = ["webkit", "moz", "ms", "o"];
  for (var x = 0; x < vendors.length && !w.requestAnimationFrame; ++x) {
    w.requestAnimationFrame = w[vendors[x] + "RequestAnimationFrame"];
    w.cancelAnimationFrame = w[vendors[x] + "CancelAnimationFrame"]
      || w[vendors[x] + "CancelRequestAnimationFrame"];
  }
  w.requestAnimationFrame || (w.requestAnimationFrame = function (callback) {
    var currTime = Date.now();
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = w.setTimeout(function () {
        callback(currTime + timeToCall)
      },
      timeToCall);
    lastTime = currTime + timeToCall;
    return id
  });
  w.cancelAnimationFrame || (w.cancelAnimationFrame = function (id) {
    clearTimeout(id);
  });
}(window));
