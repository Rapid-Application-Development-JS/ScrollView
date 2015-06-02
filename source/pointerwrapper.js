/**
 * Provide point events for DOM elements
 * @param {Element} element
 * @param {Object} listener
 * @param {Object=} context
 * @constructor
 */
function PointerWrapper(element, listener, context) {
  this._isDown = false;
  this._chancelId = false;
  this._tracks = {};
  this._tmpEvent = {};
  if (this.isTouched) {
    this._trackEvents = this.TRACK_TOUCH_EVENTS;
  } else {
    this._trackEvents = this.TRACK_EVENTS;
  }
  this.attach(element);
  this._listener = listener;
  if (typeof listener === 'object') {
    this.notify = function (event) {
      this._listener.handleEvent(event);
    };
  } else if (typeof context === 'object') {
    this.notify = function (event) {
      this._listener.apply(context, [event]);
    };
  } else {
    this.notify = function (event) {
      this._listener(event);
    };
  }
}
PointerWrapper.prototype = {
  TRACK_TOUCH_EVENTS: {
    touchstart: 'touchstart',
    touchmove: 'touchmove',
    touchend: 'touchend',
    touchleave: 'touchleave',
    touchcancel: '.touchcancel'
  },
  TRACK_EVENTS: {
    mousedown: 'mousedown',
    mousemove: 'mousemove',
    mouseup: 'mouseup',
    mouseover: 'mouseover',
    mouseout: 'mouseout'
  },
  FIRE_EVENTS: {
    up: 'pointerup',
    down: 'pointerdown',
    move: 'pointermove',
    over: 'pointerover',
    chancel: 'pointercancel',
    fling: 'fling',
    longtap: 'longtap',
    tap: 'tap'
  },
  /**
   * @type {boolean}
   */
  isTouched: !window.device.desktop(),
  /**
   * @public
   */
  attach: function (element, catchFirstEvent) {
    var old = this.detach(), attr;
    this._catch = !!catchFirstEvent;
    if (element) {
      this._el = element;
      for (attr in this._trackEvents) {
        if (this._trackEvents.hasOwnProperty(attr)) {
          this._el.addEventListener(this._trackEvents[attr], this, false);
        }
      }
    }
    return old;
  },
  /**
   * @public
   */
  detach: function () {
    var old = this._el, attr;
    if (old) {
      for (attr in this._trackEvents) {
        if (this._trackEvents.hasOwnProperty(attr)) {
          this._el.removeEventListener(this._trackEvents[attr], this);
        }
      }
    }
    this._el = null;
  },
  /**
   * @public
   */
  destroy: function () {
    this.detach();
    this._listener = null;
    this._tmpEvent = null;
  },
  /**
   * @public
   */
  handleEvent: function (event) {
    if (this._chancelId !== null) {
      clearTimeout(this._chancelId);
    }
    if (this._catch) {
      switch (event.type) {
        case this.TRACK_TOUCH_EVENTS.touchstart:
        case this.TRACK_EVENTS.mousedown:
          break;
        default:
          this._isDown = true;
          this._chancelId = false;
          this._pointerDown(event);
          break;
      }
      this._catch = false;
    }
    switch (event.type) {
      case this.TRACK_TOUCH_EVENTS.touchmove:
      case this.TRACK_EVENTS.mousemove:
        if (this._isDown) {
          this._fireEvent(this.FIRE_EVENTS.move, event);
        }
        break;
      case this.TRACK_TOUCH_EVENTS.touchstart:
      case this.TRACK_EVENTS.mousedown:
        this._isDown = true;
        this._chancelId = false;
        this._fireEvent(this.FIRE_EVENTS.down, event);
        break;
      case this.TRACK_TOUCH_EVENTS.touchend:
      case this.TRACK_TOUCH_EVENTS.touchleave:
      case this.TRACK_TOUCH_EVENTS.touchcancel:
      case this.TRACK_EVENTS.mouseup:
        if (this._isDown) {
          this._isDown = false;
          this._fireEvent(this.FIRE_EVENTS.up, event);
        }
        break;
      case this.TRACK_EVENTS.mouseover:
        if (this._isDown) {
          this._fireEvent(this.FIRE_EVENTS.over, event);
        }
        break;
      case this.TRACK_EVENTS.mouseout:
        var pointerTracker = this;
        if (this._isDown) {
          this._chancelId = setTimeout(function () {
            pointerTracker._isDown = false;
            pointerTracker._fireEvent(pointerTracker.FIRE_EVENTS.chancel, event);
            pointerTracker._chancelId = null;
          }, 10);
        }
        break;
    }
  },
  /**
   * @private
   */
  _pointerDown: function (event) {
    this._tracks = {
      start: {
        clientX: event.clientX,
        clientY: event.clientY,
        timeStamp: event.timeStamp
      },
      pre: {
        clientX: event.clientX,
        clientY: event.clientY,
        timeStamp: event.timeStamp
      },
      last: {
        clientX: event.clientX,
        clientY: event.clientY,
        timeStamp: event.timeStamp
      },
      end: {
        clientX: event.clientX,
        clientY: event.clientY,
        timeStamp: event.timeStamp
      }
    };
  },
  /**
   * @private
   */
  _pointerMove: function (event) {
    if (event.timeStamp - this._tracks.last.timeStamp > 10) {
      this._tracks.pre.clientX = this._tracks.last.clientX;
      this._tracks.pre.clientY = this._tracks.last.clientY;
      this._tracks.pre.timeStamp = this._tracks.last.timeStamp;
      this._tracks.last.clientX = event.clientX;
      this._tracks.last.clientY = event.clientY;
      this._tracks.last.timeStamp = event.timeStamp;
    }
  },
  /**
   *
   * @param {Event} event
   * @private
   */
  _pointerUp: function (event) {
    var isMoved, isFling, pointer = this._tracks;
    this._tracks.end.clientX = event.clientX;
    this._tracks.end.clientY = event.clientY;
    this._tracks.end.timeStamp = event.timeStamp;
    function distance(x1, x2, y1, y2) {
      return Math.pow(((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)), 0.5);
    }

    isMoved = Math.abs(
        distance(pointer.start.clientX, pointer.end.clientX, pointer.start.clientY, pointer.end.clientY)) > 10;
    isFling = Math.abs(
        distance(pointer.end.clientX, pointer.pre.clientX, pointer.end.clientY, pointer.pre.clientY)) > 0;
    if (isFling) {
      this._tmpEvent.type = this.FIRE_EVENTS.fling;
      this._tmpEvent.start = pointer.start;
      this._tmpEvent.end = pointer.end;
      this._tmpEvent.speedX =
        (pointer.end.clientX - pointer.pre.clientX) / (pointer.end.timeStamp - pointer.pre.timeStamp);
      this._tmpEvent.speedY =
        (pointer.end.clientY - pointer.pre.clientY) / (pointer.end.timeStamp - pointer.pre.timeStamp);
      this.notify(this._tmpEvent);
    } else if (!isMoved) {
      if (pointer.end.timeStamp - pointer.start.timeStamp > 300) {
        this._tmpEvent.type = this.FIRE_EVENTS.longtap;
        this.notify(this._tmpEvent);
      } else {
        this._tmpEvent.type = this.FIRE_EVENTS.tap;
        this.notify(this._tmpEvent);
      }
    }
    this._tracks = null;
  },
  /**
   * @private
   */
  _fireEvent: function (type, event) {
    var touchEvent = event, i, l;
    // Get coordinates
    if (this.isTouched) {
      if (event.type === this.TRACK_TOUCH_EVENTS.touchstart) {
        if (event.touches.length > 1) {
          return;
        }
        touchEvent = event.touches[0];
        this.touchID = event.touches[0].identifier;
      } else {
        if (!this.touchID) {
          this.touchID = event.changedTouches[0].identifier;
        }
        for (i = 0, l = event.changedTouches.length; i < l; i += 1) {
          touchEvent = event.changedTouches[i];
          if (touchEvent.identifier === this.touchID) {
            break;
          }
        }
        if (touchEvent.identifier !== this.touchID) {
          return;
        }
      }
    } else {
      this.touchID = 1; // Mouse
    }
    // Custom event
    this._tmpEvent.type = type;
    this._tmpEvent.start = null;
    this._tmpEvent.end = null;
    this._tmpEvent.speedX = null;
    this._tmpEvent.speedY = null;
    this._tmpEvent.screenX = touchEvent.screenX;
    this._tmpEvent.screenY = touchEvent.screenY;
    this._tmpEvent.clientX = touchEvent.clientX;
    this._tmpEvent.clientY = touchEvent.clientY;
    this._tmpEvent.pointerType = this.isTouched ? 'touch' : 'mouse';
    this._tmpEvent.target = event.target;
    this._tmpEvent.currentTarget = event.currentTarget;
    this._tmpEvent.timeStamp = event.timeStamp;
    this._tmpEvent.preventDefault = function () {
      if (event.preventDefault !== undefined) {
        event.preventDefault();
      }
    };
    this._tmpEvent.stopPropagation = function () {
      if (event.stopPropagation !== undefined) {
        event.stopPropagation();
      }
    };
    // Fire custom event
    this.notify(this._tmpEvent);
    // Save data for gesture and check
    switch (type) {
      case this.FIRE_EVENTS.down:
        this._pointerDown(this._tmpEvent);
        break;
      case this.FIRE_EVENTS.move:
        this._pointerMove(this._tmpEvent);
        break;
      case this.FIRE_EVENTS.chancel:
      case this.FIRE_EVENTS.up:
        this._pointerUp(this._tmpEvent);
        break;
    }
  }
};
