var config = {};

module.exports = {
	set: function(configuration) {
		config = configuration;
	},
	get: function() {
		return config;
	}
};
