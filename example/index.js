require.config({
	"baseUrl": "",
	"paths": {
		"app": "app"
		, "core-js": "vendors/core.js/client/core.min"
		, "device": "vendors/device/device.min"
		, "jquery": "vendors/jquery/jquery.min"
		, "radjs-scrollview": "vendors/radjs-scrollview/release/radjs-scrollview.min"
		, "webcomponents": "vendors/webcomponentsjs/webcomponents-lite.min"
		, "x-radjs-scrollview": "vendors/radjs-scrollview/release/x-radjs-scrollview.min"
	},
	"shim": {
		"app": {"deps": ["core-js", "jquery", "radjs-scrollview"]}
		, "radjs-scrollview": {"deps": ["device", "webcomponents"]}
		, "x-radjs-scrollview": {"deps": ["radjs-scrollview"]}
	},
	"waitSeconds": 0
});
require(Object.keys(requirejs.s.contexts._.config.paths), function () {
	// Load modules in object - {modulename: ExportedModule}
	var modules = (function (keys, values) {
		var pair = {};
		for (var index = 0, length = keys.length; index <= length; index += 1) {
			pair[keys[index]] = index in values ? values[index] : void(0);
		}
		return pair;
	}(Object.keys(requirejs.s.contexts._.config.paths), Array.from(arguments)));
	// Load dummy data from json file
	function fetchJSONFile(path, callback) {
		var httpRequest = new XMLHttpRequest();
		httpRequest.onreadystatechange = function () {
			if (httpRequest.readyState === 4) {
				if (httpRequest.status === 200 || httpRequest.status === 0) {
					var data = JSON.parse(httpRequest.responseText);
					if (callback) {
						callback(data);
					}
				}
			}
		};
		httpRequest.open("GET", path);
		httpRequest.send();
	}
	fetchJSONFile("data.json", function (data) {
		modules.app.start(modules, data);
	});
});
