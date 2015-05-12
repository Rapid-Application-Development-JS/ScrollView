/**
 * Scrollbar for view
 * @param {HTMLElement} container
 * @param {Object} options
 * @constructor
 */
function ScrollBar(container, options) {
  options = mix({
    className: "scrollbar",
    direction: "vertical"
  }, options);
  this.direction = options.direction;
  this._container = container;
  this._bar = document.createElement("div");
  this._bar.style.position = "absolute";
  this._bar.className = options.className;
  this._bar.style.opacity = 0;
  this._container.appendChild(this._bar);
  this._containerSize = 0;
  this._position = 0;
  this._max = 0;
  this._translateArray = this.direction === "vertical" ? ["translate3d(0, ", 0, "px, 0)"] : ["translate3d(", 0, "px, 0, 0)"];
}
ScrollBar.prototype = {
  /**
   * @private
   */
  _transformName: addVendorPrefix("transform"),
  /**
   * @private
   */
  _transitionName: addVendorPrefix("transition"),
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
    this._bar.style[this._transformName] = this._translateArray.join("");
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
    if (this.direction === "vertical") {
      this._bar.style.height = this._container.offsetHeight * (this._container.offsetHeight / (max + this._container.offsetHeight)) + "px";
      this._containerSize = this._container.offsetHeight - this._bar.offsetHeight;
    } else {
      this._bar.style.width = this._container.offsetWidth * (this._container.offsetWidth / (max + this._container.offsetWidth)) + "px";
      this._containerSize = this._container.offsetWidth - this._bar.offsetWidth;
    }
    this._bar.style[this._transitionName] = "transform 300ms";
    this.setPosition(this._position);
    setTimeout(function () {
      bar._bar.style[bar._transitionName] = "transform 0ms";
    }, 350);
  }
};
