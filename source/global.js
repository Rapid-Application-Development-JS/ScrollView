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
	var wrapperHeight = $wrapper.clientHeight;
	var wrapperWidth = $wrapper.clientWidth;
	var contentHeight = $content.scrollHeight;
	var contentWidth = $content.scrollWidth;
	var timerID = null;
	setInterval(function () {
		if (direction === "horizontal") {
			if ($wrapper.clientWidth != wrapperWidth || $content.scrollWidth != contentWidth) {
				wrapperWidth = $wrapper.clientWidth;
				contentWidth = $content.scrollWidth;
				if (wrapperWidth >= contentWidth) {
					onFit();
				} else {
					onScroll();
				}
			}
		} else if (direction === "vertical") {
			if ($wrapper.clientHeight != wrapperHeight || $content.scrollHeight != contentHeight) {
				wrapperHeight = $wrapper.clientHeight;
				contentHeight = $content.scrollHeight;
				if (wrapperHeight >= contentHeight) {
					onFit();
				} else {
					onScroll();
				}
			}
		} else {
			if ($wrapper.clientWidth != wrapperWidth || $content.scrollWidth != contentWidth
				|| $wrapper.clientHeight != wrapperHeight || $content.scrollHeight != contentHeight) {
				wrapperWidth = $wrapper.clientWidth;
				contentWidth = $content.scrollWidth;
				wrapperHeight = $wrapper.clientHeight;
				contentHeight = $content.scrollHeight;
				if (wrapperWidth >= contentWidth && wrapperHeight >= contentHeight) {
					onFit();
				} else {
					onScroll();
				}
			}
		}
	}, interval);
	this.destroy = function () {
		clearInterval(timerID);
	};
}
