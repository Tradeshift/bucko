var fs = require('fs-extra');
var path = require('path');

function TradeshiftAPIClient() {
	// TODO: something with oauth
}

TradeshiftAPIClient.prototype = {
	_request: function(httpMethod, data, url) {
	},
	getCustomers: function() {
		var file = path.resolve(__dirname, '../../data/customers.json');
		var data = fs.readJsonSync(file);
		return data;
	},
	getRecentPaidInvoices: function() {
		var file = path.resolve(__dirname, '../../data/documents.json');
		var data = fs.readJsonSync(file);
		return data;
		// ordering=LastEdit
		// ascending=false
		// type=invoice
		// page=0
		// limit=100
		// state=PAID_UNCONFIRMED
		// state=PAID_CONFIRMED
		// sales=true
		// _onlyIndex=true
		// withouttag=loyalty
	},
};

module.exports = TradeshiftAPIClient.prototype;
