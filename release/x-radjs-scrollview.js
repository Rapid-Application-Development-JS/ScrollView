(function (root, factory) {
	if (typeof define === "function" && define.amd) {
		define("x-radjs-scrollview"
			, ["radjs-scrollview", "radjs-pointer", "radjs-gesture", "webcomponentsjs"]
			, function (RADJS_ScrollView, RADJS_Pointer, RADJS_Gesture) {
				return factory(RADJS_ScrollView, RADJS_Pointer, RADJS_Gesture);
			}
		);
	} else if (typeof module === "object" && module.exports) {
		module.exports = factory(
			require("radjs-scrollview"), require("radjs-pointer"), require("radjs-gesture"), require("webcomponentsjs")
		);
	} else {
		factory(root.PointerTracker || root.RADJS_Pointer, root.GestureTracker || root.RADJS_Gesture);
	}
}(this, function (RADJS_ScrollView, RADJS_Pointer, RADJS_Gesture) {
	"use strict";
	var proto;

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

	/**
	 * Parse value from string
	 * @param {string} value
	 * @return {*}
	 */
	function parseValue(value) {
		if (!value.length) {
			return undefined;
		}
		value = value.trim();
		if (value.toLowerCase() === "true") {
			return true;
		}
		if (value.toLowerCase() === "false") {
			return false;
		}
		if (value.toLowerCase() === "null") {
			return null;
		}
		if (value.toLowerCase() === "undefined") {
			return undefined;
		}
		if (isNaN(value)) {
			return value;
		}
		if (value.indexOf(".") !== 1) {
			return parseFloat(value);
		}
		return parseInt(value, 10);
	}

	/**
	 * Parse string with options
	 * @param {string} string
	 * @return {Object}
	 */
	function parseOptions(string) {
		var result = {}, attrs, index, length, current, key;
		if (!string || !string.length) {
			return result;
		}
		attrs = string.split(";");
		for (index = 0, length = attrs.length; index < length; index += 1) {
			current = attrs[index].split(":");
			key = current[0].trim();
			if (key.length) {
				result[key] = parseValue(current[1]);
			}
		}
		return result;
	}

	proto = Object.create(HTMLDivElement.prototype);
	proto.createdCallback = function () {
		var element = this, refreshMthd,
			options = parseOptions(this.getAttribute("options"));
		if (this.isInited || !this.parentNode) {
			return;
		}
		this.isInited = true;
		if (options.scrollbar) {
			if (!options.smart || !options.smart.length) {
				options.smart = this.querySelector('[data-role="content"]');
			} else {
				try {
					options.smart = this.querySelector(options.smart);
				} catch (error) {
					console.error(error);
				}
			}
			this.scrollBar = new RADJS_ScrollView.ScrollBar(this, {
				className: options.scrollbar,
				direction: options.direction || "vertical",
				smart: options.smart
			});
			delete options.smart;
		}
		options = mix({
			// Decorate onScroll methods
			onScrollBefore: function () {
				var result = true;
				if (typeof element.onScrollBefore === "function") {
					result = element.onScrollBefore(arguments);
				}
				return result;
			},
			onScrollAfter: function () {
				if (typeof element.onScrollAfter === "function") {
					element.onScrollAfter(arguments);
				}
			},
			onScroll: function () {
				if (element.scrollBar) {
					element.scrollBar.setPosition(arguments[1]);
				}
				if (typeof element.onScroll === "function") {
					element.onScroll(arguments);
				}
			}
		}, options);
		this.scroller = new RADJS_ScrollView(this, options);
		this.pointer = new RADJS_Pointer(this);
		this.pointer.setMoveHoverState(false);
		this.gesture = new RADJS_Gesture(this);
		refreshMthd = this.scroller.refresh;
		this.scroller.refresh = function () {
			refreshMthd.apply(element.scroller, arguments);
			if (element && element.scrollBar) {
				element.scrollBar.refresh(-element.scroller._min);
			}
		};
		// Decorate scroll methods
		this.refresh = function () {
			this.scroller.refresh();
		};
		this.scroll = function (shift, duration) {
			this.scroller.scroll(shift, duration);
		};
		this.destroy = function () {
			this.scroller.destroy();
			this.pointer.destroy();
			this.gesture.destroy();
			this.scrollBar && this.scrollBar.destroy && this.scrollBar.destroy();
		};
	};
	proto.attachedCallback = function () {
		this.refresh();
	};
	proto.detachedCallback = function () {
	};
	proto.attributeChangedCallback = function (attrName, oldVal, newVal) {
	};
	return document.registerElement("x-radjs-scrollview", {
		extends: "div",
		prototype: proto
	});
}));
