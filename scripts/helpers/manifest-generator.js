const api = require('./ts-api');
const utils = require('./utils');
const templates = require('./templates');

async function generateManifest(tunnelHost, isHostFull = false) {
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

module.exports = { generateManifest };
