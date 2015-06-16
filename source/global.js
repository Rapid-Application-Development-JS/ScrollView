/**
 * Add vendor prefix
 * @param {string} property
 * @return {string}
 */
function addVendorPrefix(property) {
	var prefs = ["webkit", "moz", "ms", "o"], index, $div = document.createElement("div"),
		result = property.toLowerCase(), arrayOfPrefixes = [];

	function capitalise(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	for (index = 0; index < prefs.length; index += 1) {
		arrayOfPrefixes.push(prefs[index] + capitalise(property));
	}
	for (index = 0; index < arrayOfPrefixes.length; index += 1) {
		if ($div.style[arrayOfPrefixes[index]] !== undefined) {
			result = "-" + prefs[index] + "-" + property;
			break;
		}
	}
	return result;
}
/**
 * Extend first on object with second
 * @param {Object} old
 * @param {Object} newMixin
 * @return {Object}
 */
function mix(old, newMixin) {
	var attr;
	for (attr in newMixin) {
		if (newMixin.hasOwnProperty(attr)) {
			old[attr] = newMixin[attr];
		}
	}
	return old;
}
function ElementSizeWatch($wrapper, $content, direction, onFit, onScroll, interval) {
	this._root = $wrapper;
	this._inner = $content;
	this._root_h = $wrapper.clientHeight;
	this._root_w = $wrapper.clientWidth;
	this._inner_h = $content.scrollHeight;
	this._inner_w = $content.scrollWidth;
	this._direction = direction;
	this._onFit = onFit;
	this._onScroll = onScroll;
	var that = this;
	setInterval(function () {
		that._tick();
	}, interval);
}
ElementSizeWatch.prototype = {
	_root: null,
	_inner: null,
	_direction: null,
	_timerID: null,
	_root_h: 0,
	_root_w: 0,
	_inner_h: 0,
	_inner_w: 0,
	_onFit: null,
	_onScroll: null,
	_tick: function () {
		switch (this._direction) {
			case "horizontal":
				if (this._root.clientWidth != this._root_w || this._inner.scrollWidth != this._inner_w) {
					this._root_w = this._root.clientWidth;
					this._inner_w = this._inner.scrollWidth;
					if (this._root_w >= this._inner_w) {
						this._onFit();
					} else {
						this._onScroll();
					}
				}
				break;
			case "vertical":
				if (this._root.clientHeight != this._root_h || this._inner.scrollHeight != this._inner_h) {
					this._root_h = this._root.clientHeight;
					this._inner_h = this._inner.scrollHeight;
					if (this._root_h >= this._inner_h) {
						this._onFit();
					} else {
						this._onScroll();
					}
				}
				break;
			default:
				if (this._root.clientWidth != this._root_w || this._inner.scrollWidth != this._inner_w
					|| this._root.clientHeight != this._root_h || this._inner.scrollHeight != this._inner_h) {
					this._root_w = this._root.clientWidth;
					this._inner_w = this._inner.scrollWidth;
					this._root_h = this._root.clientHeight;
					this._inner_h = this._inner.scrollHeight;
					if (this._root_w >= this._inner_w && this._root_h >= this._inner_h) {
						this._onFit();
					} else {
						this._onScroll();
					}
				}
				break;
		}
	},
	destroy: function () {
		clearInterval(this._timerID);
	}
};
