const api = require('./ts-api');
const utils = require('./utils');
const templates = require('./templates');
const hash = require('object-hash');

async function generateManifest(tunnelHost) {
	const auth = utils.getAuth();
	const vendor = await api.getVendor(auth);
	const vendorId = vendor.VendorId;

	const clientSecret = utils.getClientSecret() || await utils.createClientSecret();

	const appName = utils.generateAppName();
	const appId = utils.convertAppNameToId(appName);
	const appUrl = utils.buildAppUrl({ appId, host: tunnelHost, vendorId });

	const app = templates.app({ appId, clientSecret, appUrl });
	const version = templates.appVersion({ appId, appName, appUrl, vendorId });

	try {
		await api.saveApp(auth, { app, vendorId });
		await utils.writeManifest(version);
		await api.releaseVersion(auth, { version });
	} catch (e) {
		return Promise.reject(e);
	}

	return Promise.resolve({ appId, appName, vendorId });
}

async function updateManifest(manifest, tunnelHost) {
	const auth = utils.getAuth();
	manifest.app.main = tunnelHost;
	manifest.app.redirect_uri = utils.buildRedirectUrl(tunnelHost);
	manifest.version = `0.0.0-${hash(manifest)}`;

	try {
		await utils.writeManifest(manifest);
		await api.releaseVersion(auth, { version: manifest });
	} catch (e) {
		return Promise.reject(e);
	}

	return Promise.resolve();
}

function getFullAppName(manifest) {
	return `${manifest.vendor_id}.${manifest.app_id}`;
}

module.exports = { generateManifest, updateManifest, getFullAppName };
