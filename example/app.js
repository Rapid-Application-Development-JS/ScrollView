define("app", function () {
	var app = {};
	app.modules = {};
	app.data = {};
	app.start = function (modules, data) {
		app.modules = modules;
		app.data = data;
		$(function () {
			app._init();
			app._createScrollVertical();
			app._initScrollHorizontal();
		});
	};
	app._init = function () {
		var zodiacsArr = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
			"Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
		var zodiacs = [];
		for (var index = 0; index < 6; index += 1) {
			zodiacs = zodiacs.concat(zodiacsArr);
		}
		this.zodiacs = zodiacs;
	};
	app._createScrollVertical = function () {
		var ModuleScrollView = app.modules["scrollviewjs"];
		var $scroll = $("#scroll-vertical").get(0);
		var $scrollv = $scroll.parentNode;
		var options = {};
		options.direction = "vertical";
		options.bounds = true;
		options.scrollbar = "scrollbar-vertical";
		options.onMoveBefore = function () {
			return false;
		};
		options.onFlingBefore = function () {
			return false;
		};
		options.onDownBefore = function () {
			return false;
		};
		//
		var $capitalV = $("<div>").attr("id", "capital-v").addClass("capital");
		$scrollv.appendChild($capitalV.get(0));
		//
		function toggle(height, position, data) {
			var index = Math.round((height - position) / (height / data.length));
			index < 0 && (index = 0);
			$capitalV.html(data[index][0]);
		}

		// Decorate onScroll methods
		options.onScrollBefore = function () {
			// Fast Scroll capital letter
			$capitalV.css("opacity", 1).show();
			toggle($scroll.offsetHeight, $scrollv.scrollHeight, app.data);
			// Actual decorator
			var result = true;
			if (typeof $scrollv.onScrollBefore === "function") {
				result = $scrollv.onScrollBefore(arguments);
			}
			return result;
		};
		options.onScrollAfter = function () {
			// Fast Scroll fadeout
			$capitalV.fadeIn();
			setTimeout(function () {
				$capitalV.hide();
			}, 450);
			// Actual decorator
			if (typeof $scrollv.onScrollAfter === "function") {
				$scrollv.onScrollAfter(arguments);
			}
		};
		options.onScroll = function (shift, position) {
			// Fast Scroll capital letter
			$capitalV.css("opacity", 1).show();
			toggle($scroll.offsetHeight, $scrollv.scrollHeight, app.data);
			// Actual decorator
			if ($scrollv.scrollBar) {
				$scrollv.scrollBar.setPosition(position);
			}
			if (typeof $scrollv.onScroll === "function") {
				$scrollv.onScroll(arguments);
			}
		};
		$scrollv.scrollBar = new ModuleScrollView.ScrollBar($scrollv, {
			className: options.scrollbar,
			direction: options.direction || "vertical"
		});
		$scrollv.scroller = new ModuleScrollView($scrollv, options);
		$scrollv.tracker = new ModuleScrollView.PointerWrapper($scrollv, $scrollv.scroller);

		/*
		$scrollv.tracker.notify = function () {
			console.info("$scrollv.tracker.notify");
			console.dir(arguments);
		};
		*/

		var refreshMthd = $scrollv.scroller.refresh;
		$scrollv.scroller.refresh = function () {
			refreshMthd.apply($scrollv.scroller, arguments);
			if ($scrollv && $scrollv.scrollBar) {
				$scrollv.scrollBar.refresh(-$scrollv.scroller._min);
			}
		};
		// Decorate scroll methods
		$scrollv.refresh = function () {
			$scrollv.scroller.refresh();
		};
		$scrollv.scroll = function (shift, duration) {
			$scrollv.scroller.scroll(shift, duration);
		};
		$scrollv.destroy = function () {
			$scrollv.scroller.destroy();
			$scrollv.tracker.destroy();
		};
		app._initScrollVertical();
	};
	app._initScrollVertical = function () {
		var $scroll = $("#scroll-vertical");
		var $ul = $scroll.find("ul");
		var docFrag = document.createDocumentFragment();
		this.data.forEach(function (value) {
			docFrag.appendChild($("<li>").html(value).get(0));
		});
		$ul.append(docFrag);
		$scroll.parent().get(0).refresh();
		app._fastScroll();
	};
	app._fastScroll = function () {
		var $scroll = $("#scroll-vertical").parent().get(0);
		var $scrollv = $("#scroll-vertical").get(0);
		var scroller = $scroll.scroller;

		function getRect(element) {
			var rect = element.getBoundingClientRect();
			return {
				top: rect.top,
				right: rect.right,
				bottom: rect.bottom,
				left: rect.left
			};
		}

		function inScrollBarArea(rect, percent, scrollPosition, clientX, clientY) {
			var scrollWidth = rect.right - rect.left;
			var feelBlock = (scrollWidth / 100) * percent;
			if (scrollPosition === "right") {
				return (clientX <= rect.right) && (clientX >= (rect.right - feelBlock));
			}
		}

		var rect = getRect($scroll);
		var feelPercent = 50;
		var scrollPosition = "right";
		var isInScrollBarArea = function (x, y) {
			return inScrollBarArea(rect, feelPercent, scrollPosition, x, y);
		};
		/*
		scroller._options.onDownBefore = function (event) {
			if (!isInScrollBarArea(event.clientX, event.clientY)) {
				scroller.handleEvent(event, true);
				return;
			}
			return false;
		};
		*/
		scroller._options.onMoveBefore = function (event) {
			if (!isInScrollBarArea(event.clientX, event.clientY)) {
				scroller.handleEvent(event, true);
				return;
			}
			var percent = ((event.clientY - rect.top) / (rect.bottom - rect.top) ) * 100;
			var topIndent = ($scrollv.offsetHeight * percent) / 100;
			scroller.jumpTo(topIndent);
			if ($scroll.scrollBar) {
				$scroll.scrollBar.setPosition(topIndent * -1);
			}
			return false;
		};
		/*
		scroller._options.onFlingBefore = function (event) {
			if (!isInScrollBarArea(event.clientX, event.clientY)) {
				scroller.handleEvent(event, true);
				return;
			}
			return false;
		};
		*/
	};
	app._initScrollHorizontal = function () {
		var $scroll = $("#scroll-horizontal");
		var table = $scroll.find("tbody");
		var docFrag = document.createDocumentFragment();
		var tr = $("<tr>");
		this.zodiacs.forEach(function (zodiac) {
			tr.append($("<td>").addClass("symbol").addClass(zodiac).html("&nbsp;"));
		});
		docFrag.appendChild(tr.get(0));
		table.append(docFrag);
		docFrag = document.createDocumentFragment();
		tr = $("<tr>");
		this.zodiacs.forEach(function (zodiac) {
			tr.append($("<td>").html(zodiac));
		});
		docFrag.appendChild(tr.get(0));
		table.append(docFrag);
		$scroll.parent().attr("is", "x-scrollviewjs").get(0).refresh();
	};
	return app;
});
