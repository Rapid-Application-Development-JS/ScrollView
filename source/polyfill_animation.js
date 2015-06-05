(function (_window) {
	var lastTime = 0;
	var vendors = ['webkit', 'moz', 'ms', 'o'];
	for (var x = 0; x < vendors.length && !_window.requestAnimationFrame; ++x) {
		_window.requestAnimationFrame = _window[vendors[x] + 'RequestAnimationFrame'];
		_window.cancelAnimationFrame = _window[vendors[x] + 'CancelAnimationFrame']
			|| _window[vendors[x] + 'CancelRequestAnimationFrame'];
	}
	_window.requestAnimationFrame || (_window.requestAnimationFrame = function (callback) {
		var currTime = Date.now();
		var timeToCall = Math.max(0, 16 - (currTime - lastTime));
		var id = _window.setTimeout(function () {
				callback(currTime + timeToCall)
			},
			timeToCall);
		lastTime = currTime + timeToCall;
		return id
	});
	_window.cancelAnimationFrame || (_window.cancelAnimationFrame = function (id) {
		clearTimeout(id);
	});
}(window));
