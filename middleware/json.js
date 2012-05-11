var isError = require('util').isError;
var body = require('./body');

var parse = body('json', function(data) {
	try {
		return JSON.parse(data || '{}') || {};
	} catch (err) {
		return {};
	}
});

var fn = function(request, response, next) {
	response.json = response.json.bind(response);
	parse(request, response, next);
};

fn.response = {};
fn.response.json = function(status, doc) {
	if (typeof status === 'number' && status >= 400 && (!doc || typeof doc === 'string')) {
		doc = {status:status, message:(doc || 'whoops')};
	}
	if (isError(status)) {
		var statusCode = status.status || status.statusCode || 500;

		this.json(statusCode, {status:statusCode, message:status.message});
		return;
	}
	if (doc) {
		this.statusCode = status;
	} else {
		doc = status;
	}

	doc = doc === undefined ? null : doc;
	doc = JSON.stringify(doc);

	this.setHeader('Content-Type', 'application/json; charset=utf-8');
	this.setHeader('Content-Length', Buffer.byteLength(doc));
	this.end(doc);
};

module.exports = fn;