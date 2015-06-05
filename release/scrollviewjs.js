(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define(function () {
			return (root.ScrollViewJS = factory());
		});
	} else if (typeof module === 'object' && module.exports) {
		module.exports = (root.ScrollViewJS = factory());
	} else {
		root.ScrollViewJS = factory();
	}
}(this, function () {
	'use strict';

/**
 * Add vendor prefix
 * @param {string} property
 * @return {string}
 */
function addVendorPrefix(property) {
	var prefs = ['webkit', 'moz', 'ms', 'o'], index, $div = document.createElement('div'),
		result = property.toLowerCase(), arrayOfPrefixes = [];

	function capitalise(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	for (index = 0; index < prefs.length; index += 1) {
		arrayOfPrefixes.push(prefs[index] + capitalise(property));
	}
	for (index = 0; index < arrayOfPrefixes.length; index += 1) {
		if ($div.style[arrayOfPrefixes[index]] !== undefined) {
			result = '-' + prefs[index] + '-' + property;
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

/**
 * Provide point events for DOM elements
 * @param {Element} element
 * @param {Object} listener
 * @param {Object=} context
 * @constructor
 */
function PointerWrapper(element, listener, context) {
	this._isDown = false;
	this._chancelId = false;
	this._tracks = {};
	this._tmpEvent = {};
	if (this.isTouched) {
		this._trackEvents = this.TRACK_TOUCH_EVENTS;
	} else {
		this._trackEvents = this.TRACK_EVENTS;
	}
	this.attach(element);
	this._listener = listener;
	if (typeof listener === 'object') {
		this.notify = function (event) {
			this._listener.handleEvent(event);
		};
	} else if (typeof context === 'object') {
		this.notify = function (event) {
			this._listener.apply(context, [event]);
		};
	} else {
		this.notify = function (event) {
			this._listener(event);
		};
	}
}
PointerWrapper.prototype = {
	TRACK_TOUCH_EVENTS: {
		touchstart: 'touchstart',
		touchmove: 'touchmove',
		touchend: 'touchend',
		touchleave: 'touchleave',
		touchcancel: '.touchcancel'
	},
	TRACK_EVENTS: {
		mousedown: 'mousedown',
		mousemove: 'mousemove',
		mouseup: 'mouseup',
		mouseover: 'mouseover',
		mouseout: 'mouseout'
	},
	FIRE_EVENTS: {
		up: 'pointerup',
		down: 'pointerdown',
		move: 'pointermove',
		over: 'pointerover',
		chancel: 'pointercancel',
		fling: 'fling',
		longtap: 'longtap',
		tap: 'tap'
	},
	/**
	 * @type {boolean}
	 */
	isTouched: !window.device.desktop(),
	/**
	 * @public
	 */
	attach: function (element, catchFirstEvent) {
		var old = this.detach(), attr;
		this._catch = !!catchFirstEvent;
		if (element) {
			this._el = element;
			for (attr in this._trackEvents) {
				if (this._trackEvents.hasOwnProperty(attr)) {
					this._el.addEventListener(this._trackEvents[attr], this, false);
				}
			}
		}
		return old;
	},
	/**
	 * @public
	 */
	detach: function () {
		var old = this._el, attr;
		if (old) {
			for (attr in this._trackEvents) {
				if (this._trackEvents.hasOwnProperty(attr)) {
					this._el.removeEventListener(this._trackEvents[attr], this);
				}
			}
		}
		this._el = null;
	},
	/**
	 * @public
	 */
	destroy: function () {
		this.detach();
		this._listener = null;
		this._tmpEvent = null;
	},
	/**
	 * @public
	 */
	handleEvent: function (event) {
		if (this._chancelId !== null) {
			clearTimeout(this._chancelId);
		}
		if (this._catch) {
			switch (event.type) {
				case this.TRACK_TOUCH_EVENTS.touchstart:
				case this.TRACK_EVENTS.mousedown:
					break;
				default:
					this._isDown = true;
					this._chancelId = false;
					this._pointerDown(event);
					break;
			}
			this._catch = false;
		}
		switch (event.type) {
			case this.TRACK_TOUCH_EVENTS.touchmove:
			case this.TRACK_EVENTS.mousemove:
				if (this._isDown) {
					this._fireEvent(this.FIRE_EVENTS.move, event);
				}
				break;
			case this.TRACK_TOUCH_EVENTS.touchstart:
			case this.TRACK_EVENTS.mousedown:
				this._isDown = true;
				this._chancelId = false;
				this._fireEvent(this.FIRE_EVENTS.down, event);
				break;
			case this.TRACK_TOUCH_EVENTS.touchend:
			case this.TRACK_TOUCH_EVENTS.touchleave:
			case this.TRACK_TOUCH_EVENTS.touchcancel:
			case this.TRACK_EVENTS.mouseup:
				if (this._isDown) {
					this._isDown = false;
					this._fireEvent(this.FIRE_EVENTS.up, event);
				}
				break;
			case this.TRACK_EVENTS.mouseover:
				if (this._isDown) {
					this._fireEvent(this.FIRE_EVENTS.over, event);
				}
				break;
			case this.TRACK_EVENTS.mouseout:
				var pointerTracker = this;
				if (this._isDown) {
					this._chancelId = setTimeout(function () {
						pointerTracker._isDown = false;
						pointerTracker._fireEvent(pointerTracker.FIRE_EVENTS.chancel, event);
						pointerTracker._chancelId = null;
					}, 10);
				}
				break;
		}
	},
	/**
	 * @private
	 */
	_pointerDown: function (event) {
		this._tracks = {
			start: {
				clientX: event.clientX,
				clientY: event.clientY,
				timeStamp: event.timeStamp
			},
			pre: {
				clientX: event.clientX,
				clientY: event.clientY,
				timeStamp: event.timeStamp
			},
			last: {
				clientX: event.clientX,
				clientY: event.clientY,
				timeStamp: event.timeStamp
			},
			end: {
				clientX: event.clientX,
				clientY: event.clientY,
				timeStamp: event.timeStamp
			}
		};
	},
	/**
	 * @private
	 */
	_pointerMove: function (event) {
		if (event.timeStamp - this._tracks.last.timeStamp > 10) {
			this._tracks.pre.clientX = this._tracks.last.clientX;
			this._tracks.pre.clientY = this._tracks.last.clientY;
			this._tracks.pre.timeStamp = this._tracks.last.timeStamp;
			this._tracks.last.clientX = event.clientX;
			this._tracks.last.clientY = event.clientY;
			this._tracks.last.timeStamp = event.timeStamp;
		}
	},
	/**
	 *
	 * @param {Event} event
	 * @private
	 */
	_pointerUp: function (event) {
		var isMoved, isFling, pointer = this._tracks;
		this._tracks.end.clientX = event.clientX;
		this._tracks.end.clientY = event.clientY;
		this._tracks.end.timeStamp = event.timeStamp;
		function distance(x1, x2, y1, y2) {
			return Math.pow(((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)), 0.5);
		}

		isMoved = Math.abs(
				distance(pointer.start.clientX, pointer.end.clientX, pointer.start.clientY, pointer.end.clientY)) > 10;
		isFling = Math.abs(
				distance(pointer.end.clientX, pointer.pre.clientX, pointer.end.clientY, pointer.pre.clientY)) > 0;
		if (isFling) {
			this._tmpEvent.type = this.FIRE_EVENTS.fling;
			this._tmpEvent.start = pointer.start;
			this._tmpEvent.end = pointer.end;
			this._tmpEvent.speedX =
				(pointer.end.clientX - pointer.pre.clientX) / (pointer.end.timeStamp - pointer.pre.timeStamp);
			this._tmpEvent.speedY =
				(pointer.end.clientY - pointer.pre.clientY) / (pointer.end.timeStamp - pointer.pre.timeStamp);
			this.notify(this._tmpEvent);
		} else if (!isMoved) {
			if (pointer.end.timeStamp - pointer.start.timeStamp > 300) {
				this._tmpEvent.type = this.FIRE_EVENTS.longtap;
				this.notify(this._tmpEvent);
			} else {
				this._tmpEvent.type = this.FIRE_EVENTS.tap;
				this.notify(this._tmpEvent);
			}
		}
		this._tracks = null;
	},
	/**
	 * @private
	 */
	_fireEvent: function (type, event) {
		var touchEvent = event, i, l;
		// Get coordinates
		if (this.isTouched) {
			if (event.type === this.TRACK_TOUCH_EVENTS.touchstart) {
				if (event.touches.length > 1) {
					return;
				}
				touchEvent = event.touches[0];
				this.touchID = event.touches[0].identifier;
			} else {
				if (!this.touchID) {
					this.touchID = event.changedTouches[0].identifier;
				}
				for (i = 0, l = event.changedTouches.length; i < l; i += 1) {
					touchEvent = event.changedTouches[i];
					if (touchEvent.identifier === this.touchID) {
						break;
					}
				}
				if (touchEvent.identifier !== this.touchID) {
					return;
				}
			}
		} else {
			this.touchID = 1; // Mouse
		}
		// Custom event
		this._tmpEvent.type = type;
		this._tmpEvent.start = null;
		this._tmpEvent.end = null;
		this._tmpEvent.speedX = null;
		this._tmpEvent.speedY = null;
		this._tmpEvent.screenX = touchEvent.screenX;
		this._tmpEvent.screenY = touchEvent.screenY;
		this._tmpEvent.clientX = touchEvent.clientX;
		this._tmpEvent.clientY = touchEvent.clientY;
		this._tmpEvent.pointerType = this.isTouched ? 'touch' : 'mouse';
		this._tmpEvent.target = event.target;
		this._tmpEvent.currentTarget = event.currentTarget;
		this._tmpEvent.timeStamp = event.timeStamp;
		this._tmpEvent.preventDefault = function () {
			if (event.preventDefault !== undefined) {
				event.preventDefault();
			}
		};
		this._tmpEvent.stopPropagation = function () {
			if (event.stopPropagation !== undefined) {
				event.stopPropagation();
			}
		};
		// Fire custom event
		this.notify(this._tmpEvent);
		// Save data for gesture and check
		switch (type) {
			case this.FIRE_EVENTS.down:
				this._pointerDown(this._tmpEvent);
				break;
			case this.FIRE_EVENTS.move:
				this._pointerMove(this._tmpEvent);
				break;
			case this.FIRE_EVENTS.chancel:
			case this.FIRE_EVENTS.up:
				this._pointerUp(this._tmpEvent);
				break;
		}
	}
};

/**
 * Scrollbar for view
 * @param {HTMLElement} container
 * @param {Object} options
 * @constructor
 */
function ScrollBar(container, options) {
	options = mix({
		className: 'scrollbar',
		direction: 'vertical'
	}, options);
	this.direction = options.direction;
	this._container = container;
	this._bar = document.createElement('div');
	this._bar.style.position = 'absolute';
	this._bar.className = options.className;
	this._bar.style.opacity = 0;
	this._container.appendChild(this._bar);
	this._containerSize = 0;
	this._position = 0;
	this._max = 0;
	this._translateArray = this.direction === 'vertical' ? ['translate3d(0, ', 0, 'px, 0)'] : ['translate3d(', 0, 'px, 0, 0)'];
}
ScrollBar.prototype = {
	/**
	 * @private
	 */
	_transformName: addVendorPrefix('transform'),
	/**
	 * @private
	 */
	_transitionName: addVendorPrefix('transition'),
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
		this._bar.style[this._transformName] = this._translateArray.join('');
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
		if (this.direction === 'vertical') {
			this._bar.style.height = this._container.offsetHeight * (this._container.offsetHeight / (max + this._container.offsetHeight)) + 'px';
			this._containerSize = this._container.offsetHeight - this._bar.offsetHeight;
		} else {
			this._bar.style.width = this._container.offsetWidth * (this._container.offsetWidth / (max + this._container.offsetWidth)) + 'px';
			this._containerSize = this._container.offsetWidth - this._bar.offsetWidth;
		}
		this._bar.style[this._transitionName] = 'transform 300ms';
		this.setPosition(this._position);
		setTimeout(function () {
			bar._bar.style[bar._transitionName] = 'transform 0ms';
		}, 350);
	}
};

var ScrollViewJS = (function () {
	/**
	 * Scroll wrapper with additional features
	 * @param {HTMLElement} element
	 * @param {Object} options - options for current instance of scrollview
	 * @extends {EventListener}
	 * @constructor
	 */
	function ScrollViewJS(element, options) {
		var scrollView = this, validPosition, tmpVar, event;
		this._options = mix({
			preventMove: true,
			resizeEvent: true,
			scroll: true,
			bounds: false,
			direction: 'vertical',
			marginMIN: 0,
			marginMAX: 0,
			onScroll: function (shift) {
				console.dir(shift);
			},
			onScrollBefore: function (shift) {
				console.dir(shift);
				return true;
			},
			onScrollAfter: function () {
			},
			onScrollTypeChange: function (type) {
			}
		}, options);
		// Initialize inner variables on creation
		if (this._options.direction === 'vertical') {
			this._transitionArray = ['translate3d(0, ', 0, 'px, 0)'];
			this._coordName = 'screenY';
			this._speedName = 'speedY';
		} else {
			this._transitionArray = ['translate3d(', 0, 'px, 0, 0)'];
			this._coordName = 'screenX';
			this._speedName = 'speedX';
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
		validPosition = ['fixed', 'relative', 'absolute'];
		tmpVar = validPosition.indexOf(window.getComputedStyle(element, null).position);
		if (tmpVar === -1) {
			tmpVar = validPosition.indexOf(element.style.position);
		}
		if (tmpVar === -1) {
			this._root.style.position = 'relative';
		} else {
			this._root.style.position = validPosition[tmpVar];
		}
		this._root.style.overflow = 'hidden';
		this._wrapper.style.margin = 0;
		this._wrapper.style.position = 'absolute';
		this._wrapper.style[this._transitionName] = 'transform 0ms';
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
			scrollView._wrapper.style[scrollView._transformName] = scrollView._transitionArray.join('');
			scrollView._shift = 0;
		};
		// Start
		this.refresh();
	}

	ScrollViewJS.prototype = {
		TRACKING_EVENTS: {
			resize: 'resize',
			up: 'pointerup',
			move: 'pointermove',
			down: 'pointerdown',
			chancel: 'pointercancel',
			fling: 'fling'
		},
		_STRINGS: {
			tweak: 'tweak',
			checkTweak: 'checkTweak',
			stop: 'stop',
			scroll: 'scroll',
			fling: 'fling',
			move: 'move'
		},
		_transitionName: addVendorPrefix('transition'),
		_transformName: addVendorPrefix('transform'),
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
					this._tmp.velocity = this._animParams.velocity + this._animParams.a * (now - this._animParams.startTime);
					// Check changing of velocity sign
					if (this._tmp.velocity / this._animParams.velocity > 0) {
						this._animParams.velocity = this._tmp.velocity;
						// Decrease velocity when scroller out of borders
						if (((this._pos < this._min) && (this._animParams.velocity > 0)) ||
							((this._pos > this._max) && (this._animParams.velocity < 0))) {
							this._animParams.velocity += -this._animParams.velocity * 0.6;
							if (Math.abs(this._shift) < 0.1) {
								this._motionType = this._STRINGS.checkTweak;
							}
						}
					} else {
						this._motionType = this._STRINGS.checkTweak;
					}
					break;
				case this._STRINGS.tweak:
				case this._STRINGS.scroll:
					this._tmp.now = Math.ceil(1000 * (now - this._animParams.startTime) / this._animParams.duration) / 1000;
					this._tmp.easing = this.easeFunc(this._tmp.now);
					this._tmp.shift = Math.ceil(1000 * this._animParams.shift * this._tmp.easing) / 1000;
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
							this._tmp.shift = this._pos - Math.ceil(1000 * Math.round(this._pos / this._options.tweak) * this._options.tweak) / 1000;
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
			var V = this._options.scroll ? -event[this._speedName] : 0;
			if (V === 0) {
				return;
			}
			this._animParams = {
				velocity: V,
				a: -(V < 0 ? -1 : 1) * 0.00009,
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
			if (this._options.direction === 'vertical') {
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
					scrollType = "percent";
				} else {
					scrollType = "pixel";
				}
				position = parseFloat(to);
			} else if (to instanceof Element) {
				scrollType = "element";
			} else {
				scrollType = "pixel";
				position = parseFloat(to);
			}
			position < 0 && (position = 0);
			switch (scrollType) {
				case "pixel":
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
					break;
			}
		},
		handleEvent: function (event, ignoreBeforeAfter) {
			var self = this;
			switch (event.type) {
				case this.TRACKING_EVENTS.down:
					if ((typeof this._options["onDownBefore"] === "function") && (!ignoreBeforeAfter)) {
						if (this._options["onDownBefore"](event) === false) {
							return;
						}
					}
					this._eventPointerDown(event);
					if ((typeof this._options["onDownAfter"] === "function") && (!ignoreBeforeAfter)) {
						this._options["onDownAfter"](event);
					}
					break;
				case this.TRACKING_EVENTS.move:
					if ((typeof this._options["onMoveBefore"] === "function") && (!ignoreBeforeAfter)) {
						if (this._options["onMoveBefore"](event) === false) {
							return;
						}
					}
					this._eventPointerMove(event);
					if (this._options.preventMove && !this.preventDefaultTags.test(event.target)) {
						event.preventDefault();
					}
					if ((typeof this._options["onMoveAfter"] === "function") && (!ignoreBeforeAfter)) {
						this._options["onMoveAfter"](event);
					}
					break;
				case this.TRACKING_EVENTS.cancel:
					if ((typeof this._options["onCancelBefore"] === "function") && (!ignoreBeforeAfter)) {
						if (this._options["onCancelBefore"](event) === false) {
							return;
						}
					}
					this._eventPointerUp(event);
					if ((typeof this._options["onCancelAfter"] === "function") && (!ignoreBeforeAfter)) {
						this._options["onCancelAfter"](event);
					}
					break;
				case this.TRACKING_EVENTS.up:
					if ((typeof this._options["onUpBefore"] === "function") && (!ignoreBeforeAfter)) {
						if (this._options["onUpBefore"](event) === false) {
							return;
						}
					}
					this._eventPointerUp(event);
					if ((typeof this._options["onUpAfter"] === "function") && (!ignoreBeforeAfter)) {
						this._options["onUpAfter"](event);
					}
					break;
				case this.TRACKING_EVENTS.fling:
					if ((typeof this._options["onFlingBefore"] === "function") && (!ignoreBeforeAfter)) {
						if (this._options["onFlingBefore"](event) === false) {
							return;
						}
					}
					this._eventFling(event);
					if ((typeof this._options["onFlingAfter"] === "function") && (!ignoreBeforeAfter)) {
						this._options["onFlingAfter"](event);
					}
					break;
				case this.TRACKING_EVENTS.resize:
					if ((typeof this._options["onResizeBefore"] === "function") && (!ignoreBeforeAfter)) {
						if (this._options["onResizeBefore"](event) === false) {
							return;
						}
					}
					clearTimeout(this._resizeID);
					var that = this;
					this._resizeID = setTimeout(function () {
						self.refresh();
						if ((typeof that._options["onResizeAfter"] === "function") && (!ignoreBeforeAfter)) {
							that._options["onResizeAfter"](event);
						}
					}, 150);
					break;
			}
		}
	};
	ScrollViewJS.ScrollBar = ScrollBar;
	ScrollViewJS.PointerWrapper = PointerWrapper;
	return ScrollViewJS;
}());


	return ScrollViewJS;
}));
