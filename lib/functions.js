function debugLogger (mode) {
	this.mode = mode;

	if (this.mode == "debug") console.log("debug mode : enabled");

	this.log = function (msg) {
		if (this.mode == "debug") console.log(msg);
	}
}

function async ( parameters, callback) {
	$.get( server_url, parameters,
	function(data){
		if (callback) callback (JSON.parse(data));
	});
}
