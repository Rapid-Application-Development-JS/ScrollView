define("app", function () {
	var app = {};
	app.modules = {};
	app.data = {};
	app.start = function (modules, data) {
		app.modules = modules;
		app.data = data;
		$(app._domready);
	};
	app._domready = function () {
		app._init();
		app._createScrollVertical();
		app._initScrollHorizontal();
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
		var ModuleScrollView = app.modules["scrollview"];
		var $scroll = $("#scroll-vertical").get();
		var $scrollv = $scroll.parentNode;
		var options = {};
		options.direction = "vertical";
		options.bounds = true;
		options.scrollbar = "scrollbar-vertical";
		//
		var capitalV = $("<div>");
		capitalV.attr("id", "capital-v").addClass("capital");
		$scrollv.appendChild(capitalV.get());
		//
		function toggle(height, position, data) {
			capitalV.html(data[Math.round((height - position) / (height / data.length))][0]);
		}

		// Decorate onScroll methods
		options.onScrollBefore = function () {
			// Fast Scroll capital letter
			capitalV.css("opacity", 1).show();
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
			capitalV.fadeIn();
			setTimeout(function () {
				capitalV.hide();
			}, 450);
			// Actual decorator
			if (typeof $scrollv.onScrollAfter === "function") {
				$scrollv.onScrollAfter(arguments);
			}
		};
		options.onScroll = function (shift, position) {
			// Fast Scroll capital letter
			capitalV.css("opacity", 1).show();
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
		var scroll = $("#scroll-vertical");
		var ul = scroll.find("ul").get();
		var docFrag = document.createDocumentFragment();
		this.data.forEach(function (value) {
			docFrag.appendChild($("<li>").html(value).get());
		});
		ul.appendChild(docFrag);
		scroll.parent().get().refresh();
	};
	app._initScrollHorizontal = function () {
		var scroll = $("#scroll-horizontal");
		var table = scroll.find("tbody").get();
		var docFrag = document.createDocumentFragment();
		var tr = $("<tr>").get();
		this.zodiacs.forEach(function (zodiac) {
			tr.appendChild($("<td>").addClass("symbol").addClass(zodiac).html("&nbsp;").get());
		});
		docFrag.appendChild(tr);
		table.appendChild(docFrag);
		docFrag = document.createDocumentFragment();
		tr = $("<tr>").get();
		this.zodiacs.forEach(function (zodiac) {
			tr.appendChild($("<td>").html(zodiac).get());
		});
		docFrag.appendChild(tr);
		table.appendChild(docFrag);
		var $xscroll = scroll.parent();
		$xscroll.attr("is", "x-scrollviewjs");
		$xscroll.get().refresh();
	};
	return app;
});
