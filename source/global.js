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
