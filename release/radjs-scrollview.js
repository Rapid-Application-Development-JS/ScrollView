(function (root, factory) {
	if (typeof define === "function" && define.amd) {
		define("radjs-scrollview", function () {
			root.RADJS_ScrollView = factory();
			return root.RADJS_ScrollView;
		});
	} else if (typeof module === "object" && module.exports) {
		root.RADJS_ScrollView = factory();
		module.exports = root.RADJS_ScrollView;
	} else {
		root.RADJS_ScrollView = factory();
	}
}(this, function () {
	"use strict";

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

(function (_window) {
	_window.Date.now || (_window.Date.now = function () {
		return +new Date;
	});
})(window);

(function (_window) {
	_window.performance || (_window.performance = {});
	_window.performance.now && (_window.performance.now = performance.webkitNow || performance.mozNow || performance.msNow ||
		performance.oNow || function () {
			return Date.now()
		})
})(window);

(function (_window) {
	var lastTime = 0;
	var vendors = ["webkit", "moz", "ms", "o"];
	for (var x = 0; x < vendors.length && !_window.requestAnimationFrame; ++x) {
		_window.requestAnimationFrame = _window[vendors[x] + "RequestAnimationFrame"];
		_window.cancelAnimationFrame = _window[vendors[x] + "CancelAnimationFrame"]
			|| _window[vendors[x] + "CancelRequestAnimationFrame"];
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

/**
 * Scrollbar for view
 * @param {HTMLElement} container
 * @param {Object} options
 * @constructor
 */
function ScrollBar(container, options) {
	options = mix({
		className: "scrollbar",
		direction: "vertical"
	}, options);
	this.direction = options.direction;
	this._container = container;
	this._bar = document.createElement("div");
	this._bar.style.position = "absolute";
	this._bar.className = options.className;
	this._bar.style.opacity = 0;
	this._container.appendChild(this._bar);
	this._containerSize = 0;
	this._position = 0;
	this._max = 0;
	this._translateArray = this.direction === "vertical" ? ["translate3d(0, ", 0, "px, 0)"] : ["translate3d(", 0, "px, 0, 0)"];
}
ScrollBar.prototype = {
	/**
	 * @private
	 */
	_transformName: addVendorPrefix("transform"),
	/**
	 * @private
	 */
	_transitionName: addVendorPrefix("transition"),
	/**
	 * @public
	 */
	setPosition: function (position) {
		this._position = position;
		this._translateArray[1] = -position * this._containerSize / this._max;
		if (this._translateArray[1] <= 0) {
			this._translateArray[1] = 0;
		} else if (this._translateArray[1] >= this._containerSize) {
			this._translateArray[1] = this._containerSize;
		}
		this._bar.style[this._transformName] = this._translateArray.join("");
	},
	/**
	 * @public
	 */
	refresh: function (max) {
		var bar = this;
		this._max = max;
		if (Math.max(0, max) === 0) {
			this._bar.style.opacity = 0;
		} else {
			this._bar.style.opacity = 1;
		}
		if (this.direction === "vertical") {
			this._bar.style.height = this._container.offsetHeight * (this._container.offsetHeight / (max + this._container.offsetHeight)) + "px";
			this._containerSize = this._container.offsetHeight - this._bar.offsetHeight;
		} else {
			this._bar.style.width = this._container.offsetWidth * (this._container.offsetWidth / (max + this._container.offsetWidth)) + "px";
			this._containerSize = this._container.offsetWidth - this._bar.offsetWidth;
		}
		this._bar.style[this._transitionName] = "transform 300ms";
		this.setPosition(this._position);
		setTimeout(function () {
			bar._bar.style[bar._transitionName] = "transform 0ms";
		}, 350);
	}
};

var ScrollView = (function () {
	/**
	 * Scroll wrapper with additional features
	 * @param {HTMLElement} element
	 * @param {Object} options - options for current instance of scrollview
	 * @extends {EventListener}
	 * @constructor
	 */
	function ScrollView(element, options) {
		var scrollView = this, validPosition, tmpVar, event;
		this._options = mix({
			preventMove: true,
			resizeEvent: true,
			scroll: true,
			bounds: false,
			direction: "vertical",
			marginMIN: 0,
			marginMAX: 0,
			onScroll: function (shift) {
			},
			onScrollBefore: function (shift) {
				return true;
			},
			onScrollAfter: function () {
			},
			onScrollTypeChange: function (type) {
			}
		}, options);
		// Initialize inner variables on creation
		if (this._options.direction === "vertical") {
			this._transitionArray = ["translate3d(0, ", 0, "px, 0)"];
			this._coordName = "screenY";
			this._speedName = "speedY";
		} else {
			this._transitionArray = ["translate3d(", 0, "px, 0, 0)"];
			this._coordName = "screenX";
			this._speedName = "speedX";
		}
		this._animParams = null; // move or not in current time scrolling view
		this._RafID = null; // ID of request animation frame
		this._lastPointerPosition = 0; // position of touch pointer, when is touched
		this._shift = 0; // shift for next requestAnimationFrame tick
		this._motionType = this._lastMotionType = this._STRINGS.stop;
		this._isMoved = false;
		this._tmp = {shift: 0, now: 0, easing: 0, velocity: 0};
		this._pos = 0;
		this._root = element;
		this._wrapper = element.firstElementChild;
		// Prepare environment
		validPosition = ["fixed", "relative", "absolute"];
		tmpVar = validPosition.indexOf(window.getComputedStyle(element, null).position);
		if (tmpVar === -1) {
			tmpVar = validPosition.indexOf(element.style.position);
		}
		if (tmpVar === -1) {
			this._root.style.position = "relative";
		} else {
			this._root.style.position = validPosition[tmpVar];
		}
		this._root.style.overflow = "hidden";
		this._wrapper.style.margin = 0;
		this._wrapper.style.position = "absolute";
		this._wrapper.style[this._transitionName] = "transform 0ms";
		for (event in this.TRACKING_EVENTS) {
			if (this.TRACKING_EVENTS.hasOwnProperty(event)) {
				this._root.addEventListener(this.TRACKING_EVENTS[event], this, false);
			}
		}
		if (this._options.resizeEvent) {
			window.addEventListener(this.TRACKING_EVENTS.resize, this, false);
		}
		// Animation step function
		this._animationStep = function (timestamp) {
			if (!scrollView._options.scroll) {
				return;
			}
			scrollView._calculateShift(timestamp);
			scrollView._pos -= scrollView._shift;
			// Check bounds
			if ((scrollView._motionType !== scrollView._STRINGS.tweak) ||
				(scrollView._motionType !== scrollView._STRINGS.stop)) {
				if (scrollView._pos < scrollView._min - scrollView._margine) {
					scrollView._pos = scrollView._min - scrollView._margine;
					scrollView._motionType = scrollView._STRINGS.checkTweak;
				}
				if (scrollView._pos > scrollView._margine + scrollView._max) {
					scrollView._pos = scrollView._margine + scrollView._max;
					scrollView._motionType = scrollView._STRINGS.checkTweak;
				}
			}
			if (scrollView._shift !== 0) { // Callbacks
				if ((!scrollView._isMoved) && !scrollView._options.onScrollBefore(scrollView._shift)) {
					scrollView._motionType = scrollView._STRINGS.stop;
				} else {
					scrollView._isMoved = true;
					scrollView._options.onScroll(scrollView._shift, scrollView._pos);
					// Call onScrollTypeChange callback if type of motion was changed
					if ((scrollView._lastMotionType !== scrollView._motionType) &&
						(scrollView._motionType !== scrollView._STRINGS.checkTweak) &&
						(scrollView._motionType !== scrollView._STRINGS.stop)) {
						scrollView._options.onScrollTypeChange(scrollView._motionType);
						scrollView._lastMotionType = scrollView._motionType;
					}
				}
			}
			scrollView._transitionArray[1] = scrollView._pos;
			// Endpoint round or post next loop
			if (scrollView._motionType === scrollView._STRINGS.stop) {
				scrollView._transitionArray[1] = Math.round(scrollView._transitionArray[1]);
				if (scrollView._isMoved) {
					scrollView._options.onScrollAfter();
				}
				scrollView._isMoved = false;
			} else {
				scrollView._RafID = window.requestAnimationFrame(scrollView._animationStep);
			}
			scrollView._wrapper.style[scrollView._transformName] = scrollView._transitionArray.join("");
			scrollView._shift = 0;
		};
		// Start
		this.refresh();
	}

	ScrollView.prototype = {
		TRACKING_EVENTS: {
			resize: "resize",
			up: "pointerup",
			move: "pointermove",
			down: "pointerdown",
			chancel: "pointercancel",
			fling: "fling",
			leave: "pointerleave"
		},
		_STRINGS: {
			tweak: "tweak",
			checkTweak: "checkTweak",
			stop: "stop",
			scroll: "scroll",
			fling: "fling",
			move: "move"
		},
		_transitionName: addVendorPrefix("transition"),
		_transformName: addVendorPrefix("transform"),
		_calculateShift: function (now) {
			// If it first time of RAF loop - save timestamp for calculations
			if (this._animParams.startTime === null) {
				this._animParams.startTime = now;
				this._animParams.lastTime = now;
			}
			// Check different types of motion
			switch (this._motionType) {
				case this._STRINGS.move:
					this._shift /= ((this._pos < this._min) || (this._pos > this._max)) ? 3 : 1;
					break;
				case this._STRINGS.fling:
					// Setup shift value & decrease velocity
					this._shift = this._animParams.velocity * (now - this._animParams.lastTime);
					this._tmp.velocity =
						this._animParams.velocity + this._animParams.a * (now - this._animParams.startTime);
					// Check changing of velocity sign
					if (this._tmp.velocity / this._animParams.velocity > 0) {
						this._animParams.velocity = this._tmp.velocity;
						// Decrease velocity when scroller out of borders
						if (((this._pos < this._min) && (this._animParams.velocity > 0)) ||
							((this._pos > this._max) && (this._animParams.velocity < 0))) {
							this._animParams.velocity += -this._animParams.velocity * 0.6;
							if (Math.abs(this._shift) < 0.05) {
								this._motionType = this._STRINGS.checkTweak;
							}
						}
					} else {
						this._motionType = this._STRINGS.checkTweak;
					}
					break;
				case this._STRINGS.tweak:
				case this._STRINGS.scroll:
					this._tmp.now = Math.ceil(1e3 * (now - this._animParams.startTime) / this._animParams.duration) / 1e3;
					this._tmp.easing = this.easeFunc(this._tmp.now);
					this._tmp.shift = Math.ceil(1e3 * this._animParams.shift * this._tmp.easing) / 1e3;
					if (this._animParams.duration !== 0) {
						this._shift = this._tmp.shift - this._animParams.lastShift;
					} else {
						this._shift = this._animParams.shift;
						this._tmp.now = 1;
					}
					if (this._tmp.now >= 1) {
						if (this._motionType === this._STRINGS.tweak) {
							this._shift = this._animParams.shift - this._animParams.lastShift;
							this._motionType = this._STRINGS.stop;
						} else {
							this._motionType = this._STRINGS.checkTweak;
						}
					}
					this._animParams.lastShift = this._tmp.shift;
					break;
				case this._STRINGS.checkTweak:
					if (this._pos > this._max) {
						this._tmp.shift = this._max - this._pos;
					} else {
						if (this._pos < this._min) {
							this._tmp.shift = this._min - this._pos;
						} else {
							this._tmp.shift = 0;
						}
					}
					if (this._options.tweak && this._tmp.shift === 0) {
						if (this._pos < this._max && this._pos > this._min) {
							this._tmp.shift = this._pos -
								Math.ceil(1e3 * Math.round(this._pos / this._options.tweak) * this._options.tweak) / 1e3;
							this._tmp.shift = -this._tmp.shift;
						}
					}
					this._animParams = {
						shift: -this._tmp.shift,
						lastShift: 0,
						duration: 250,
						startTime: now,
						lastTime: null
					};
					if (this._tmp.shift !== 0) {
						this._motionType = this._STRINGS.tweak;
					} else {
						this._motionType = this._STRINGS.stop;
					}
					break;
			}
			this._animParams.lastTime = now;
			this._shift = (!isNaN(this._shift)) ? this._shift : 0;
		},
		_eventPointerDown: function (event) {
			window.cancelAnimationFrame(this._RafID); // stop any animations
			this._lastPointerPosition = event[this._coordName]; //save current position for next loop of RAF
			this._animParams = {}; //start looping by requestAnimationFrame
			this._motionType = this._STRINGS.move;
			this._RafID = window.requestAnimationFrame(this._animationStep);
		},
		_eventPointerMove: function (event) {
			this._shift += this._lastPointerPosition - event[this._coordName];
			this._lastPointerPosition = event[this._coordName];
		},
		_eventPointerUp: function (event) {
			if (this._motionType !== this._STRINGS.fling) {
				this._motionType = this._STRINGS.checkTweak;
			}
			this._eventPointerMove(event);
		},
		_eventFling: function (event) {
			var velocity = this._options.scroll ? -event[this._speedName] : 0;
			if (velocity === 0) {
				return;
			}
			this._animParams = {
				velocity: velocity,
				a: -(velocity < 0 ? -1 : 1) * 0.00009,
				startTime: null,
				lastTime: null
			};
			this._motionType = this._STRINGS.fling;
		},
		preventDefaultTags: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/,
		easeFunc: function (time) {
			return time * (2 - time);
		},
		destroy: function () {
			var event;
			for (event in this.TRACKING_EVENTS) {
				if (this.TRACKING_EVENTS.hasOwnProperty(event)) {
					this._root.removeEventListener(this.TRACKING_EVENTS[event], this);
				}
			}
			window.removeEventListener(this.TRACKING_EVENTS.resize, this);
			window.cancelAnimationFrame(this._RafID);
			this._root = null;
			this._wrapper = null;
			this._options = null;
		},
		refresh: function () {
			var rootWidth = this._root.offsetWidth, rootHeight = this._root.offsetHeight;
			window.cancelAnimationFrame(this._RafID);
			this._motionType = this._STRINGS.stop;
			if (this._options.direction === "vertical") {
				this._min = (rootHeight <= this._wrapper.clientHeight) ?
				rootHeight - this._wrapper.clientHeight - this._options.marginMAX : 0;
				this._margine = (this._options.bounds) ? Math.round(rootHeight / 3) : 0;
			} else {
				this._min = (rootWidth <= this._wrapper.offsetWidth) ?
				rootWidth - this._wrapper.clientWidth - this._options.marginMAX : 0;
				this._margine = (this._options.bounds) ? Math.round(rootWidth / 3) : 0;
			}
			this._max = this._options.marginMIN;
			this._motionType = this._STRINGS.checkTweak; // prepare and start tweak
			this._animParams = {};
			this._RafID = window.requestAnimationFrame(this._animationStep);
		},
		scroll: function (shift, duration) {
			var newDuration = duration, newShift, newPos;
			window.cancelAnimationFrame(this._RafID);
			this._motionType = this._STRINGS.stop;
			// check bounds
			if (shift !== 0) {
				newPos = this._pos + shift;
				if (newPos < this._min) {
					newShift = this._min - this._pos;
					newDuration = Math.abs(Math.round(duration * newShift / shift));
					shift = newShift;
				}
				if (newPos > this._max) {
					newShift = this._max - this._pos;
					newDuration = Math.abs(Math.round(duration * newShift / shift));
					shift = newShift;
				}
			}
			shift = this._options.scroll ? shift : 0;
			this._motionType = this._STRINGS.scroll; //start looping by requestAnimationFrame
			this._animParams = {
				shift: -shift,
				lastShift: 0,
				duration: newDuration,
				startTime: null,
				lastTime: null
			};
			this._RafID = window.requestAnimationFrame(this._animationStep);
		},
		jumpTo: function (to) {
			var scrollType, position = 0;
			if (typeof to === "string") {
				if(to.slice(-1) === "%") {
					scrollType = 1; // percent
				} else {
					scrollType = 0; // pixel
				}
				position = parseFloat(to);
			} else if (to instanceof Element) {
				scrollType = 2; // element
			} else {
				scrollType = 0; // pixel
				position = parseFloat(to);
			}
			position < 0 && (position = 0);
			switch (scrollType) {
				case 0: // pixel
					var contentSize = 0;
					if (this._options.direction == "vertical") {
						contentSize = this._wrapper.offsetHeight - this._root.offsetHeight;
						position > contentSize && (position = contentSize);
						position = parseInt(position) * -1;
						this._wrapper.style[this._transformName] = "translate3d(0, " + position + "px, 0)";
					} else {
						contentSize = this._wrapper.offsetWidth;
						position > contentSize && (position = contentSize);
						position = parseInt(position);
						this._wrapper.style[this._transformName] = "translate3d(" + position + "px, 0, 0)";
					}
					this._pos = position + this._shift;
					this._shift = 0;
					this._lastPointerPosition = event[this._coordName];
					this._motionType = this._STRINGS.checkTweak;
					break;
				case 1: //percent
					// @todo implement
					break;
				case 2: //element
					// @todo implement
					break;
			}
		},
		handleEvent: function (event, ignoreBeforeAfter) {
			var that = this;
			function aspectBeforeAfter(fnOnName) {
				return typeof that._options[fnOnName] === "function" && (!ignoreBeforeAfter);
			} // if in options named function is defined and should not be ignored by `ignoreBeforeAfter`
			function disallowFire(fnOnName) {
				return that._options[fnOnName](event) === false;
			} // function with this event return false, and event should be prevented
			function preventBefore (fnOnName) {
				return aspectBeforeAfter(fnOnName) && disallowFire(fnOnName);
			}
			function callAfter(fnOnName) {
				if (aspectBeforeAfter(fnOnName)) {
					that._options[fnOnName](event);
				}
			}
			switch (event.type) {
				case this.TRACKING_EVENTS.down:
					if (preventBefore("onDownBefore")) {
						return;
					}
					this._eventPointerDown(event);
					callAfter("onDownAfter");
					break;
				case this.TRACKING_EVENTS.move:
					if (preventBefore("onMoveBefore")) {
						return;
					}
					this._eventPointerMove(event);
					if (this._options.preventMove && !this.preventDefaultTags.test(event.target)) {
						event.preventDefault();
					}
					callAfter("onMoveAfter");
					break;
				case this.TRACKING_EVENTS.cancel:
					if (preventBefore("onCancelBefore")) {
						return;
					}
					this._eventPointerUp(event);
					callAfter("onCancelAfter");
					break;
				case this.TRACKING_EVENTS.up:
					if (preventBefore("onUpBefore")) {
						return;
					}
					this._eventPointerUp(event);
					callAfter("onUpAfter");
					break;
				case this.TRACKING_EVENTS.leave:
					if (preventBefore("onLeaveBefore")) {
						return;
					}
					this._eventPointerUp(event);
					callAfter("onLeaveAfter");
					break;
				case this.TRACKING_EVENTS.fling:
					if (preventBefore("onFlingBefore")) {
						return;
					}
					this._eventFling(event);
					callAfter("onFlingAfter");
					break;
				case this.TRACKING_EVENTS.resize:
					if (preventBefore("onResizeBefore")) {
						return;
					}
					clearTimeout(this._resizeID);
					this._resizeID = setTimeout(function () {
						that.refresh();
						callAfter("onResizeAfter");
					}, 250);
					break;
			}
		}
	};
	ScrollView.ScrollBar = ScrollBar;
	return ScrollView;
}());


	return ScrollView;
}));
