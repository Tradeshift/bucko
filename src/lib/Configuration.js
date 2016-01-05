var _ = require('lodash');
var fs = require('fs');
var path = require('path');

function Configuration(data) {
	this._data = data;
}

Configuration.prototype = {
	isLocalDevelopment: function() {
		return this._data.local;
	},

	getTradeshiftHost: function() {
		return this._data.host.tradeshift;
	},
	getTradeshiftAuthLoginPath: function() {
		return this._data.path.tradeshift.auth.login;
	},
	getTradeshiftAuthTokenPath: function() {
		return this._data.path.tradeshift.auth.token;
	},
	getTradeshiftAuthLoginUri: function() {
		return ['https://', this.getTradeshiftHost(), this.getTradeshiftAuthLoginPath()].join('');
	},
	getTradeshiftAuthTokenUri: function() {
		return ['https://', this.getTradeshiftHost(), this.getTradeshiftAuthTokenPath()].join('');
	},
	getUIComponentsVersion: function() {
		return this._data.uiComponents.version;
	},

	getAppId: function() {
		return this._data.manifest.app_id;
	},
	getVendorId: function() {
		return this._data.manifest.vendor_id;
	},
	getVersion: function() {
		return this._data.manifest.version;
	},
	getClientId: function() {
		return [this.getVendorId(), this.getAppId()].join('.');
	},
	getClientIdWithVersion: function() {
		return [this.getClientId(), this.getVersion()].join('.');
	},
	getManifest: function() {
		return this._data.manifest;
	},

	getAuthSecret: function() {
		return this._data.oauth.secret;
	},
	getAppHost: function() {
		return this._data.host.app;
	},
	getAppPaths: function() {
		return this._data.path.app;
	},
	getAuthCallbackUri: function() {
		return ['https://', this.getAppHost(), this.getAppPaths().authCallback].join('');
	},
};

Configuration.load = function(rootPath) {
	var config = {};
	var files = ['defaults', 'local', 'oauth'];
	_.forEach(files, function(value, key) {
		var file = path.resolve(rootPath, [value, '.json'].join(''));
		var data = JSON.parse(fs.readFileSync(file));
		_.merge(config, data);
	});
	return new Configuration(config);
};

module.exports = Configuration;
