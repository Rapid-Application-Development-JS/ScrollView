require.config({
  "baseUrl": "",
  "paths": {
    "app": "app"
    , "corejs": "vendors/core.js/client/core.min"
    , "$": "vendors/$/$"
    , "device": "vendors/device/device.min"
    , "webcomponents": "vendors/webcomponentsjs/webcomponents-lite.min"
    , "scrollviewjs": "../release/scrollviewjs"
    , "x-scrollviewjs": "../release/x-scrollviewjs"
  },
  "shim": {
    "app": {"deps": ["$", "scrollviewjs"]}
    , "$": {"deps": ["corejs"]}
    , "scrollviewjs": {"deps": ["device", "webcomponents"]}
    , "x-scrollviewjs": {"deps": ["scrollviewjs"]}
  },
  "waitSeconds": 0
});
require(["app", "scrollviewjs", "x-scrollviewjs"], function (app, scrollviewjs) {
  function fetchJSONFile(path, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200 || httpRequest.status === 0) {
          var data = JSON.parse(httpRequest.responseText);
          if (callback) callback(data);
        }
      }
    };
    httpRequest.open('GET', path);
    httpRequest.send();
  }
  fetchJSONFile('data.json', function (data) {
    app.start({scrollview: scrollviewjs}, data);
  });
});
