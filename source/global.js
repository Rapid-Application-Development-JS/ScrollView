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
