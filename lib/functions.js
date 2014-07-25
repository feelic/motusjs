function debugLogger (mode) {
	this.mode = mode;

	if (this.mode == "debug") console.log("debug mode : enabled");

	this.log = function (msg) {
		if (this.mode == "debug") console.log(msg);
	}
}

function async ( parameters, callback) {
	if (config.useLocalServer) url = config.serverUrl;
	else url = config.defaultServerUrl;
	
	$.get( url, parameters,
	function(data){
		if (callback) callback(JSON.parse(data));
	});
}
