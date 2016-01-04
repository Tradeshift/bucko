var Configuration = require('./lib/Configuration');

var config = new Configuration({});

module.exports = {
	set: function(configuration) {
		config = configuration;
	},
	get: function() {
		return config;
	}
};
