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
		var ModuleScrollView = app.modules["radjs-scrollview"]; // Scroll view constructor
		var $scrollContent = $("#scroll-vertical").get(0); // Content to be scrolled
		var $scrollView = $scrollContent.parentNode; // Container for the content
		var options = {};
		options.direction = "vertical";
		options.bounds = true;
		options.scrollbar = "scrollbar-vertical"; // CSS class
		var $bookmark = $("<div>").attr("id", "bookmark").addClass("bookmark"); // Create bookmark element
		$scrollView.appendChild($bookmark.get(0));
		/**
		 * Function that toggles letter in bookmark
		 */
		function bookmarkUpdate(height, position) {
			var index = Math.round((height - position) / (height / app.data.length)); // calculate position on the data
			if (index < 0) {
				index = 0;
			} else if (index + 1 > app.data.length) {
				index = app.data.length - 1;
			}
			$bookmark.html(app.data[index][0]); // extract first letter
		}

		function bookmarkHide() {
			$bookmark.fadeOut(); // Fast scroll bookmark fadeout when scrolling stopped
			setTimeout(function () {
				$bookmark.hide();
			}, 450);
		}

		function bookmarkShow() {
			$bookmark.css("opacity", 1).show(); // Fast Scroll effect with capital letter
		}

		/**
		 * Decorate `onScrollBefore`
		 * @return {boolean}
		 */
		options.onScrollBefore = function () {
			bookmarkShow();
			bookmarkUpdate($scrollContent.offsetHeight, $scrollView.scrollHeight);
			// Call actual function
			var result = true;
			if (typeof $scrollView.onScrollBefore === "function") {
				result = $scrollView.onScrollBefore(arguments);
			}
			return result;
		};
		/**
		 * Decorate `onScrollAfter`
		 */
		options.onScrollAfter = function () {
			bookmarkHide();
			if (typeof $scrollView.onScrollAfter === "function") { // Call actual function
				$scrollView.onScrollAfter(arguments);
			}
		};
		options.onScroll = function (shift, position) {
			bookmarkShow();
			bookmarkUpdate($scrollContent.offsetHeight, $scrollView.scrollHeight);
			if ($scrollView.scrollBar) { // If scroll bar defined
				$scrollView.scrollBar.setPosition(position);
			}
			if (typeof $scrollView.onScroll === "function") { // Call actual function
				$scrollView.onScroll(arguments);
			}
		};
		// Create custom scroll bar
		$scrollView.scrollBar = new app.modules["radjs-scrollview"].ScrollBar($scrollView, {
			className: options.scrollbar,
			direction: options.direction || "vertical"
		});
		$scrollView.scroller = new app.modules["radjs-scrollview"]($scrollView, options); // Create and attach view
		// Create and attach custom pointer events, because of: IE < 11 support, SVG elements, and links bugs
		$scrollView.pointer = new app.modules["radjs-pointer"]($scrollView);
		$scrollView.pointer.setMoveHoverState(false);
		// Actually pointer events currently supported almost everywhere, but buggy and not configurable
		// You can replace "radjs-pointer" with other library or even remove it
		$scrollView.gesture = new app.modules["radjs-gesture"]($scrollView);
		// At this point gesture events supported for any browser and device.
		// You can replace it with your library that supports events like: hold, fling, longtap, tap, doubletap
		var refreshMethod = $scrollView.scroller.refresh;
		// Decorator for `refresh`
		$scrollView.scroller.refresh = function () {
			refreshMethod.apply($scrollView.scroller, arguments);
			if ($scrollView && $scrollView.scrollBar) {
				$scrollView.scrollBar.refresh(-$scrollView.scroller._min);
			}
		};
		// Decorate scroll methods
		$scrollView.refresh = function () {
			$scrollView.scroller.refresh();
		};
		/**
		 * Decorate scroll method
		 */
		$scrollView.scroll = function (shift, duration) {
			$scrollView.scroller.scroll(shift, duration);
		};
		/**
		 * Decorate destroy method
		 */
		$scrollView.destroy = function () {
			$scrollView.scroller.destroy();
			$scrollView.pointer.destroy();
			$scrollView.gesture.destroy();
		};
		// Add content
		var $ul = $($scrollContent).find("ul");
		var docFrag = document.createDocumentFragment();
		this.data.forEach(function (value) {
			docFrag.appendChild($("<li>").html(value).get(0));
		});
		$ul.append(docFrag);
		$scrollContent.parentNode.refresh();

		// Add fast scroll fucntionality
		var scroller = $scrollView.scroller;

		function extractRect(element) {
			var rect = element.getBoundingClientRect();
			return {top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left};
		}

		function inArea(rect, percent, scrollPosition, clientX, clientY) {
			if (scrollPosition === "right") {
				var scrollWidth = rect.right - rect.left;
				var feelBlock = (scrollWidth * .01) * percent;
				return (clientX <= rect.right) && (clientX >= (rect.right - feelBlock));
			}
		}

		var rect = extractRect($scrollView);
		var feelPercent = 25; // Scroll bar in right area starts to respond to touch after this percent
		var scrollPosition = "right";
		/**
		 * Is pointer in scrollbar area
		 */
		var isInScrollBarArea = function (x, y) {
			return inArea(rect, feelPercent, scrollPosition, x, y); //
		};
		// Change options on the fly
		/**
		 * When window is resized we should kkep an eye on our content
		 */
		scroller._options.onResizeAfter = function () {
			rect = extractRect($scrollView); // Watch for element actual dimensions
		};

		scroller._options.onDownBefore = function (event) {
			if (!isInScrollBarArea(event.clientX, event.clientY)) { // The event took place outside of the scroll area
				// You catch those event params, modify them and pass to handler method
				// Example: scroller.handleEvent(event, true);
				return;
			}
			return false; // prevent default action
		};
		scroller._options.onMoveBefore = function (event) {
			if (!isInScrollBarArea(event.clientX, event.clientY)) {
				return;
			}
			// Get pointer event for new scroll position
			var percent = ((event.clientY - rect.top) / (rect.bottom - rect.top) ) * 100;
			var topIndent = ($scrollContent.offsetHeight * percent) * .01;
			scroller.jumpTo(topIndent); // Jump to position
			if ($scrollView.scrollBar) { // Only if there is a scrollbar
				$scrollView.scrollBar.setPosition(topIndent * -1);
			}
			// Update bookmark
			bookmarkShow();
			bookmarkUpdate($scrollContent.offsetHeight, $scrollView.scrollHeight);
			return false;
		};
		scroller._options.onUpBefore = function () {
			bookmarkHide();
		};
		scroller._options.onFlingBefore = function (event) {
			return isInScrollBarArea(event.clientX, event.clientY) === false; // prevent default action if needed
		};
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
		$scroll.parent().attr("is", "x-radjs-scrollview").get(0).refresh(); // indicate that element is webcomponent
	};
	return app;
});
