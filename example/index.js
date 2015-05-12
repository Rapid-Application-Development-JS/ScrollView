require.config({
	"baseUrl": "",
	"paths": {
		"device": "vendors/device/device.min",
		"webcomponents": "vendors/webcomponentsjs/webcomponents-lite.min",
		"scrollviewjs": "vendors/scrollviewjs/scrollviewjs.min"
	},
	"shim": {
		"scrollviewjs": {
			"deps": ["device", "webcomponents"]
		}
	},
	"waitSeconds": 0
});
require(["scrollviewjs"]);
