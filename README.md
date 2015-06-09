ScrollView
===========

Scroll wrapper with additional features.

## Advantages:

* Lightweight;
* Cross browser compatible;
* Tested on different devices and platforms;
* High performance, on the par and faster than other libraries;
* Can be used as library with declarative options and as WebComponent;
* Has fast and stable scroll events using JavaScript callbacks for everything;
* Has callback on lot of events like pointer down, scroll, fling, scroll beyond the borders etc.;
* Highly customizable. Scrollbar customizable too.

## Install

Install using Bower.

```bash
bower install --save radjs-scrollview
```

Or using npm.

```bash
npm install --save radjs-scrollview
```

If you target browser without `Custom Element` support you should include WebComponents polyfill.

```bash
bower install --save webcomponentsjs
```

## Include

It is recommended to use libraries like `RequireJS` or `SystemJS` for module loading to prevent global namespace pollution.

```javascript
require.config({
	"paths": {
		"radjs-scrollview": "vendors/radjs-scrollview/release/radjs-scrollview.min",
		// If you want use scroll view as WebComponent include also these files
		"x-radjs-scrollview": "vendors/radjs-scrollview/release/x-radjs-scrollview.min",
		// Polyfill is no longer needed for:
		// Chrome 36+, Opera 29+, Android Browser 4.4.4+, Chrome for Android 42+
		"webcomponents": "vendors/webcomponentsjs/webcomponents-lite.min"
	}
});
require(["radjs-scrollview"]), function () {});
```

## Use as WebComponent

After including `x-radjs-scrollview` file only thing you need to do is add attribute `is` to your HTML code.
Options for webcomponent are taken from `options` attribute.
**Note:** You can freely add `is` attribute after document loading.

```html
<div is="x-radjs-scrollview"
	options="direction: horizontal; bounds: false; scrollbar: scrollbar-horizontal;">
	<div class="scroll-content">
		 <ul>
				<li>Very long list</li>
		 </ul>
	</div>
</div>
```

## Usage as library

Very simple usage, just to scrollable content.

```javascript
new ScrollView(document.getElementById("scroll"), {direction: "vertical"});
```

Full usage:

```javascript
 // Content to be scrolled
var $scrollContent = document.getElementById("content-scroll-vertical");
var $scrollView = $scrollContent.parentNode; // Container for the content
var options = {
	bounds: true,
	direction: "vertical",
	scrollbar: "scrollbar-vertical" // CSS class
};
$scrollView.scroll_bar = new ScrollView.ScrollBar($scrollView, {
	className: options.scrollbar,
	direction: options.direction
}); // `scroll_bar` it's just a custom name
// Create and attach ScrollView.
// `scroller` it's just a custom name, but in WebComponent it's predefined.
$scrollView.scroller = new ScrollView($scrollView, options);
// Create and attach custom pointer events, because of: IE support, SVG elements etc.
// `tracker` is also custom name but it's also predefined in WebComponent
$scrollView.tracker = new ScrollView.PointerWrapper($scrollView, $scrollView.scroller);
```

See for more advanced usage in examples folder.

## API

### `ScrollView` creating options.

##### preventMove

Boolean, default is *true*. Prevent default on move event, also never works on input, textarea, button, select.

###### resizeEvent

Boolean, default is *true*. Track `Window` resize event.

###### scroll

Boolean, default is *true*. Scroll HTML element with content inside wrapper, not only tracking such event.

###### bounds

Boolean, default is *false*. Scroll event called beyound boundaries.

###### direction

String, default is "vertical". Scroll direction.

###### marginMIN

Number, default is zero. Minimal margin of HTML element, after refresh in example.

###### marginMAX

Number, default is zero. Maximum margin of scrollable content inside wrapper.

### Event functions

###### onScrollBefore (shift: number)

Function, default is function that returns true. Function that called before scroll event happening. To start scrolling function should return `true`.

###### onScroll (shift: number, position: number)

Function, default is function that returns true. Function called when scroll happening.

###### onScrollAfter ()

Function, default is empty function. Function called after scroll ends, no arguments.

###### onScrollTypeChange (scrollType: string)

Function, default is empty function. Function called when scroll type changes.

### Additional event functions

`onDownBefore` and `onDownAfter` - callbacks called before and after pointer down event.

`onMoveBefore` and `onMoveAfter` - callbacks called before and after pointer move event.

`onCancelBefore` and `onCancelAfter` - callbacks called before and after pointer cancel event.

`onUpBefore` and `onUpAfter` - callbacks called before and after pointer up event.

`onFlingBefore` and `onFlingAfter` - callbacks called before and after fling.

`onResizeBefore` and `onResizeAfter` - callbacks called before and after window resize.

Example usage:

```javascript
options.onFlingBefore = function (event) {
	// prevent default action if needed
	// returning strictly boolean `false` will prevent handling this event
	return false;
};
```

### Public parameters and methods

**constructor**

```javascript
var preserve = new ScrollView(document.getElementById("scroll"), {direction: "vertical"});
```

**preventDefaultTags**

Regular expression with tags that will not respond on pointer events.

```javascript
options.preventDefaultTags = /^(INPUT|TEXTAREA|BUTTON|SELECT)$/;
```

**easeFunc**

Function to calculate easing time between animations.

```javascript
$scrollView.easeFunc = function (microtime) {
	return microtime * (2 - microtime);
};
```

**destroy**

Detach `ScrollView` from HTML element.

```javascript
var $scroll = document.getElementById("scroll");
$scroll.scroller = new ScrollView($scroll, {direction: "vertical"});
// ...
$scroll.scroller.destroy();
```

**refresh**

Refresh scrollable content inside ScrollView.

```javascript
var $scroll = document.getElementById("scroll");
$scroll.scroller = new ScrollView($scroll, {direction: "vertical"});
// ...
$scroll.scroller.refresh();
```

**scroll**

Smooth content scroll to specified position for a specified time. You have to pass negative numbers.

```javascript
var $scroll = document.getElementById("scroll");
$scroll.scroller = new ScrollView($scroll, {direction: "vertical"});
$scroll.scroll(-640, 1000);
```

**jumpTo**

This method will *jump* content to position.

```javascript
var $scroll = document.getElementById("scroll");
$scroll.scroller = new ScrollView($scroll, {direction: "vertical"});
$scroll.jumpTo(640);
```

**handleEvent**

Handle event by `ScrollView`.

```javascript
var $scrollView = document.getElementById("scroll");
$scrollView.scroller = new ScrollView($scroll, {
	direction: "vertical",
	onDownBefore: function (event) {
		 if (something_happend) {
				// You can catch those event params, modify them and pass to handler method
				$scrollView.scroller.handleEvent(event, true);
				return;
		 }
		 return false; // prevent default action
	}
});
```

### Internal plugins

### ScrollBar

Create custom scroll bar.

```javascript
var $scrollView = document.getElementById("scroll-wrapper");
var options = {};
$scrollView.scroll_bar = new ScrollView.ScrollBar($scrollView, {
	className: "bem--scroll_bar",
	direction: "vertical"
});
options.onScroll = function (shift, position) {
	if ($scrollView.scroll_bar) { // If scrollbar defined
		 $scrollView.scroll_bar.setPosition(position);
	}
	if (typeof $scrollView.onScroll === "function") {
		 $scrollView.onScroll(arguments);
	}
};
$scrollView.scroller = new ScrollView($scrollView, options);
```

### PointerWrapper

Provide point events for DOM elements.

```javascript
var $scrollView = document.getElementById("scroll-wrapper");
$scrollView.scroller = new ScrollView($scrollView, {});
$scrollView.tracker = new ScrollView.PointerWrapper($scrollView, $scrollView.scroller);
$scrollView.destroy = function () {
	$scrollView.scroller.destroy();
	$scrollView.tracker.destroy();
};
```

