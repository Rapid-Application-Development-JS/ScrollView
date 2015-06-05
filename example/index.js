require.config({
	"baseUrl": "",
	"paths": {
		"app": "app"
		, "core-js": "vendors/core.js/client/core.min"
		, "device": "vendors/device/device.min"
		, "jquery": "vendors/jquery/jquery.min"
		, "radjs-gesture": "vendors/radjs-gesture/release/gesture.min"
		, "radjs-pointer": "vendors/radjs-pointer/release/pointer.min"
		, "scrollviewjs": "../release/scrollviewjs"
		, "webcomponents": "vendors/webcomponentsjs/webcomponents-lite.min"
		, "x-scrollviewjs": "../release/x-scrollviewjs"
	},
	"shim": {
		"app": {"deps": ["core-js", "jquery", "scrollviewjs"]}
		, "scrollviewjs": {"deps": ["device", "webcomponents"]}
		, "x-scrollviewjs": {"deps": ["scrollviewjs"]}
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
