define("app", function () {
  var app = {};
  app.modules = {};
  app.start = function (modules) {
    app.modules = modules;
    if (document.readyState == "complete") {
      app._domready();
    } else {
      document.addEventListener("DOMContentLoaded", function () {
        app._domready();
      }, false);
    }
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
    var $scrollv = document.getElementById("scroll-vertical").parentNode;
    var options = {};
    options.direction = "vertical";
    options.bounds = true;
    options.scrollbar = "scrollbar-vertical";
    // Decorate onScroll methods
    options.onScrollBefore = function () {
      var result = true;
      if (typeof $scrollv.onScrollBefore === "function") {
        result = $scrollv.onScrollBefore(arguments);
      }
      return result;
    };
    options.onScrollAfter = function () {
      if (typeof $scrollv.onScrollAfter === "function") {
        $scrollv.onScrollAfter(arguments);
      }
    };
    options.onScroll = function () {
      if ($scrollv.scrollBar) {
        $scrollv.scrollBar.setPosition(arguments[1]);
      }
      if (typeof $scrollv.onScroll === "function") {
        $scrollv.onScroll(arguments);
      }
    };
    if (options.scrollbar) {
      $scrollv.scrollBar = new ModuleScrollView.ScrollBar($scrollv, {
        className: options.scrollbar,
        direction: options.direction || "vertical"
      });
    }
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
    var scroll = document.getElementById("scroll-vertical");
    var table = scroll.getElementsByTagName("tbody")[0];
    var docFrag = document.createDocumentFragment();
    this.zodiacs.forEach(function (zodiac) {
      var tr = document.createElement("tr");
      var td = document.createElement("td");
      td.classList.add("symbol");
      td.classList.add(zodiac);
      td.innerHTML = "&nbsp;";
      tr.appendChild(td);
      td = document.createElement("td");
      td.innerHTML = zodiac;
      tr.appendChild(td);
      docFrag.appendChild(tr);
    });
    table.appendChild(docFrag);
    scroll.parentNode.refresh();
  };
  app._initScrollHorizontal = function () {
    var scroll = document.getElementById("scroll-horizontal");
    var table = scroll.getElementsByTagName("tbody")[0];
    var docFrag = document.createDocumentFragment();
    var tr = document.createElement("tr");
    this.zodiacs.forEach(function (zodiac) {
      var td = document.createElement("td");
      td.classList.add("symbol");
      td.classList.add(zodiac);
      td.innerHTML = "&nbsp;";
      tr.appendChild(td);
    });
    docFrag.appendChild(tr);
    table.appendChild(docFrag);
    docFrag = document.createDocumentFragment();
    tr = document.createElement("tr");
    this.zodiacs.forEach(function (zodiac) {
      var td = document.createElement("td");
      td.innerHTML = zodiac;
      tr.appendChild(td);
    });
    docFrag.appendChild(tr);
    table.appendChild(docFrag);
    var $xscroll = scroll.parentNode;
    $xscroll.setAttribute("is", "x-scrollviewjs");
    $xscroll.refresh();
  };
  return app;
});
