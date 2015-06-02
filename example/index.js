require.config({
  "baseUrl": "",
  "paths": {
    "app": "app"
    , "device": "vendors/device/device.min"
    , "webcomponents": "vendors/webcomponentsjs/webcomponents-lite.min"
    , "scrollviewjs": "../release/scrollviewjs"
    , "x-scrollviewjs": "../release/x-scrollviewjs"
  },
  "shim": {
    "app": {"deps": ["scrollviewjs"]}
    , "scrollviewjs": {"deps": ["device", "webcomponents"]}
    , "x-scrollviewjs": {"deps": ["scrollviewjs"]}
  },
  "waitSeconds": 0
});
require(["app", "scrollviewjs", "x-scrollviewjs"], function (app, scrollviewjs) {
  app.start({scrollview: scrollviewjs});
});
