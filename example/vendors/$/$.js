window.$ = (function () {
	var q = function (element) {
		this.$el = Array.isArray(element) ? element : [element];
	};
	q.prototype = {
		$el: []
		, map: function (array, callback) {
			if (typeof array === "function") {
				return this.$el.map(array);
			}
			return array.map(callback);
		}
		, hide: function () {
			this.css("display", "none");
			return this;
		}
		, show: function () {
			this.css("display", "block");
			return this;
		}
		, html: function () {
			if (arguments.length) {
				var html = arguments[0] || "";
				this.map(function (element) {
					element.innerHTML = html;
				});
			}
			return arguments.length ? this : this.get().innerHTML;
		}
		, css: function () {
			var property = arguments[0] || "";
			var that = this;
			if (arguments.length > 1) {
				if (typeof property != "object") {
					var value = arguments[1];
					var priority = arguments[2] || "";
					this.map(function (element) {
						if (!element) {
							return;
						}
						if (element.constructor && (element.constructor.name === that.constructor.name)) {
							element.css(property, value, priority);
						} else {
							element.style.setProperty(property, value, priority);
						}
					});
				} else {
					for (var key in property) {
						this.css(key, property[key]);
					}
				}
				return this;
			} else {
				var el = this.get();
				return el ? el.style[property] : "";
			}
		}
		, get: function (index) {
			if (arguments.length) {
				index = +index;
			} else {
				index = 0;
			}
			return index in this.$el ? this.$el[index] : null;
		}
		, fadeIn: function () {
			var that = this, opacity = 1;
			var timer = setInterval(function () {
				if (opacity <= .1) {
					clearInterval(timer);
					that.css("display", "none");
				}
				that.css("opacity", opacity).css("filter", 'alpha(opacity=' + opacity * 100 + ")");
				opacity -= opacity * .1;
			}, 50);
		}
		, fadeOut: function () {
			var that = this, opacity = .1;
			this.css("display", "block");
			var timer = setInterval(function () {
				if (opacity >= 1) {
					clearInterval(timer);
				}
				that.css("opacity", opacity).css("filter", 'alpha(opacity=' + opacity * 100 + ")");
				opacity += opacity * .1;
			}, 10);
		}
		, attr: function () {
			var name = arguments[0];
			var value = arguments[1] || "";
			if (arguments.length > 1) {
				this.map(function (element) {
					element.setAttribute(name, value);
				});
			} else if (arguments.length) {
				var el = this.get();
				if (el) {
					return el.getAttribute(name);
				}
			}
			return this;
		}
		, addClass: function (className) {
			this.map(function (element) {
				element.classList.add(className);
			});
			return this;
		}
		, removeClass: function (className) {
			this.map(function (element) {
				element.classList.remove(className);
			});
			return this;
		}
		, find: function (selector) {
			var el = this.get();
			if (!el) {
				return fire();
			}
			return fire(selector);
		}
		, parent: function () {
			var el = this.get();
			if (!el) {
				return fire();
			}
			if ("parentNode" in el) {
				return fire(el.parentNode);
			}
			return fire();
		}
	};
	var fire = function (val) {
		if (val) {
			if (typeof val === "string") {
				if (val[0] === "<") {
					val = document.createElement(val.slice(1, -1));
				} else {
					val = Array.from(document.querySelectorAll(val));
				}
			}
			if (typeof val === "function") {
				if (document.readyState == "complete") {
					val();
				} else {
					document.addEventListener("DOMContentLoaded", val, false);
				}
			}
		}
		return new q(val);
	};
	return fire;
}());
