define("app", function () {
	var app = {};
	app.modules = {};
	app.start = function (modules, data) {
		app.modules = modules; // Loaded JS modules
		(app.data_vertical = data) && (data = null); // Dummy data for vertical scroll
		app.data_horizontal = []; // Dummy data for horizontal scroll
            if ( document ) {
                app._init();
                app._createScrollVertical();
                app._initScrollHorizontal();
            }
        // Wait for DOM ready
	};
	app._init = function () {
		// Create example data for horizontal scroll
		"Aries,Taurus,Gemini,Cancer,Leo,Virgo,Libra,Scorpio,Sagittarius,Capricorn,Aquarius,Pisces".
			split(",").forEach(function (value, index, collection) {
				this.data_horizontal = this.data_horizontal.concat(collection);
			}, this);
	};
	app._createScrollVertical = function () {
		var elScrollContent = document.getElementById('scroll-vertical'); // Content to be scrolled
		var elScrollView = elScrollContent.parentNode; // Container for the content
		var options = {};
        var $summ;
		options.direction = "vertical";
		options.bounds = true;
		options.scrollbar = "scrollbar-vertical"; // CSS class
		var $bookmark = document.createElement('div'); // Create bookmark element
            $bookmark.setAttribute('id','bookmark');
            $bookmark.classList.add('bookmark');
        $summ = document.getElementsByClassName('bookmark').length;
            elScrollView.appendChild($bookmark);


		/**
		 * Function that toggles letter in bookmark
		 */
		function bookmarkUpdate(height, position) {
			// Calculate position in list
			var index = Math.round((height - position) / (height / app.data_vertical.length));
			if (index < 0) {
				index = 0;
			} else if (index + 1 > app.data_vertical.length) {
				index = app.data_vertical.length - 1;
			}
                $bookmark.innerText =app.data_vertical[index][0]; // Extract first letter

		}

		function bookmarkHide() {
                $bookmark.setAttribute('style','opacity: 0'); // Fast scroll bookmark fadeout when scrolling stopped

			setTimeout(function () {
                $bookmark.setAttribute('style','display: none;');
			}, 2000);
		}

		function bookmarkShow() {

                $bookmark.setAttribute('style','opacity: 1');
                $bookmark.setAttribute('style','display: block;'); // Fast Scroll effect with capital letter, make fully visible

        }

		/**
		 * Decorate `onScrollBefore`
		 * @return {boolean}
		 */
		options.onScrollBefore = function () {
			bookmarkShow();
			bookmarkUpdate(elScrollContent.offsetHeight, elScrollView.scrollHeight);
			// Call actual function
			var result = true;
			if (typeof elScrollView.onScrollBefore === "function") {
				result = elScrollView.onScrollBefore(arguments);
			}
			return result;
		};
		/**
		 * Decorate `onScrollAfter`
		 */
		options.onScrollAfter = function () {
			bookmarkHide();
			if (typeof elScrollView.onScrollAfter === "function") { // Call actual function
				elScrollView.onScrollAfter(arguments);
			}
		};
		options.onScroll = function (shift, position) {
			bookmarkShow();
			bookmarkUpdate(elScrollContent.offsetHeight, elScrollView.scrollHeight);
			if (elScrollView.scrollBar) { // If scroll bar defined
				elScrollView.scrollBar.setPosition(position);
			}
			if (typeof elScrollView.onScroll === "function") { // Call actual function
				elScrollView.onScroll(arguments);
			}
		};
		// Create custom scroll bar
		elScrollView.scrollBar = new app.modules["radjs-scrollview"].ScrollBar(elScrollView, {
			className: options.scrollbar,
			direction: options.direction || "vertical",
			smart: elScrollContent // Accepts content to watched for size changes and hides scrollbar if content fits
		});
		// Scroll View:
		elScrollView.scroller = new app.modules["radjs-scrollview"](elScrollView, options); // Create and attach view
		// Pointer Events:
		// Create and attach custom pointer events, because of: IE < 11 support, SVG elements, and links bugs
		elScrollView.pointer = new app.modules["radjs-pointer"](elScrollView);
		elScrollView.pointer.setMoveHoverState(false);
		// Actually pointer events currently supported almost everywhere, but buggy and not configurable
		// Gesture Events:
		// You can replace "radjs-pointer" with other library or even remove it
		elScrollView.gesture = new app.modules["radjs-gesture"](elScrollView);
		// At this point gesture events supported for any browser and device.
		// You can replace it with your library that supports events like: hold, fling, longtap, tap, doubletap
		// Decorator fucntions:
		var refreshMethod = elScrollView.scroller.refresh;
		// Decorator for `refresh`
		elScrollView.scroller.refresh = function () {
			refreshMethod.apply(elScrollView.scroller, arguments);
			if (elScrollView && elScrollView.scrollBar) {
				elScrollView.scrollBar.refresh(-elScrollView.scroller._min);
			}
		};
		// Decorate scroll methods
		elScrollView.refresh = function () {
			elScrollView.scroller.refresh();
		};
		/**
		 * Decorate scroll method
		 */
		elScrollView.scroll = function (shift, duration) {
			elScrollView.scroller.scroll(shift, duration);
		};
		/**
		 * Decorate destroy method
		 */
		elScrollView.destroy = function () {
			elScrollView.scroller.destroy();
			elScrollView.pointer.destroy();
			elScrollView.gesture.destroy();
			elScrollView.scrollBar.destroy();
		};
		// Add content
		var $ul = elScrollContent.getElementsByTagName('ul');
		this.data_vertical.forEach(function (value) {
            var $li = document.createElement('li');
            $li.appendChild(document.createTextNode(value));
            $ul[0].appendChild($li);
		});
		$ul = null;
		elScrollContent.parentNode.refresh();
		// Add fast scroll fucntionality
		var scroller = elScrollView.scroller;

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

		var rect = extractRect(elScrollView);
		var feelPercent = 20; // Scroll bar in right area starts to respond to touch after this percent
		var div = document.createElement('div');
        div.setAttribute('style','backgroundColor : rgba(0, 0, 0, .03); '+
        'bottom: 0; '+
        'cursor: "ns-resize; '+
        'position: "absolute; '+
        'right: 0; '+
        'top: 0; '+
        'width:'+ feelPercent + '%; ');
        elScrollView.appendChild(div); // Shady layer showing the user scroll border
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
			rect = extractRect(elScrollView); // Watch for element actual dimensions
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
			if (!elScrollView.pointer.isDown) {
				return;
			}// pointer not `pushed` or leave elemnet and back `pushed` but still funciton need to be ended
			if (!isInScrollBarArea(event.clientX, event.clientY)) {
				return;
			}
			// Get pointer event for new scroll position
			var percent = ((event.clientY - rect.top) / (rect.bottom - rect.top) ) * 100;
			var topIndent = (elScrollContent.offsetHeight * percent) * .01;
			scroller.jumpTo(topIndent); // Jump to position
			if (elScrollView.scrollBar) { // Only if there is a scrollbar
				elScrollView.scrollBar.setPosition(topIndent * -1);
			}
			// Update bookmark
			bookmarkShow();
			bookmarkUpdate(elScrollContent.offsetHeight, elScrollView.scrollHeight);
			return false;
		};
		scroller._options.onUpBefore = function () {
			bookmarkHide();
		};
		scroller._options.onFlingBefore = function (event) {
			return isInScrollBarArea(event.clientX, event.clientY) === false; // Prevent default action if needed
		};
		scroller._options.onFlingBefore = function (event) {
			return isInScrollBarArea(event.clientX, event.clientY) === false; // Prevent default action if needed
		};
		scroller._options.onCancelAfter = scroller._options.onUpAfter = scroller._options.onLeaveAfter = function () {
			bookmarkHide();
		};
	};
	app._initScrollHorizontal = function () {
		var _scroll = document.getElementsByTagName('div');
        var $scroll = [];
        for (var i =0; i<_scroll.length; i++) {
            if(_scroll[i].attributes.getNamedItem('id') !== null){
                if(_scroll[i].attributes.getNamedItem('id').textContent == "scroll-horizontal"){
                    $scroll.push(_scroll[i]);
                }
            }
        }

		var $tbody = $scroll[0].getElementsByTagName('tbody');
		var $tr = document.createElement('tr');
		this.data_horizontal.forEach(function (zodiac) {
            var $td = document.createElement('td');
            $td.setAttribute('class','symbol '+ zodiac);
//            $td.textContent='&nbsp;';
			$tr.appendChild($td);
		});
		$tbody[0].appendChild($tr);
		$tr = document.createElement('tr');
		this.data_horizontal.forEach(function (zodiac) {
            var $td = document.createElement('td');
            $td.textContent = zodiac;
			$tr.appendChild($td);
		});
		delete this.data_horizontal;
		$tbody[0].appendChild($tr);
        $scroll[0].parentNode.refresh(); // Indicates that element is webcomponent
	};
	return app;
});
