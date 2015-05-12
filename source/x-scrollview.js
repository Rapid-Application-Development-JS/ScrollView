(function () {
  var proto;
  proto = Object.create(HTMLDivElement.prototype);
  proto.createdCallback = function () {
    var element = this, refreshMthd,
      options = parseOptions(this.getAttribute("options"));
    if (this.isInited || !this.parentNode) {
      return;
    }
    this.isInited = true;
    if (options.scrollbar) {
      this.scrollBar = new ScrollViewJS.ScrollBar(this, {
        className: options.scrollbar,
        direction: options.direction || "vertical"
      });
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
    this.scroller = new ScrollViewJS(this, options);
    this.tracker = new PointerWrapper(this, this.scroller);
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
      this.tracker.destroy();
    };
  };
  proto.attachedCallback = function () {
    this.refresh();
  };
  proto.detachedCallback = function () {
  };
  proto.attributeChangedCallback = function (attrName, oldVal, newVal) {
  };
  return document.registerElement("x-scrollviewjs", {
    extends: "div",
    prototype: proto
  });
}());
