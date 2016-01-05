var _ = require('lodash');
var fs = require('fs-extra');
var mime = require('mime');
var path = require('path');

function buildUrl(host, path) {
	return ['https://', host, path].join('');
}

function encodeImages(images) {
	var output = {};
	_.forEach(images, function(image) {
		var file = path.resolve(__dirname, '../../images/', image);
		var data = fs.readFileSync(file).toString('base64');
		output[path.basename(image)] = ['data:', mime.lookup(image), ';base64,', data].join('');
	});
	return output;
}

function buildManifest(config) {
	var data = _.defaults({}, config.getManifest());
	var host = config.getAppHost();
	var paths = config.getAppPaths();

	data.app = {
		main: buildUrl(host, paths.main),
		redirect_uri: buildUrl(host, paths.authCallback),
	};
	data.capabilities = {
		access: _.pairs(data.permissions).filter(_.last).map(_.first),
	};
	data.images = encodeImages(data.icons);
	data.locales = {};
	data.locales[data.default_locale] = {
		app_desc: data.app_desc,
		app_name: data.app_name,
	};

	delete data.app_desc;
	delete data.app_name;
	delete data.permissions;

	var fileName = ['manifest-', data.app_id, '-', data.version, '.json'].join('');
	var manifest = path.resolve(__dirname, '../../manifest/', fileName);
	fs.outputJsonSync(manifest, data);

	return fileName;
}

module.exports = {
	build: buildManifest,
};
