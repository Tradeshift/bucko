const hash = require('object-hash');
const api = require('./ts-api');
const utils = require('./utils');
const templates = require('./templates');

function cloneObject(manifest) {
	return Object.keys(manifest).reduce((res, key) => {
		if (typeof manifest[key] === 'string') {
			res[key] = manifest[key];
		} else {
			res[key] = { ...manifest[key] };
		}
		return res;
	}, {});
}

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

	const version = cloneObject(manifest);
	version.app.main = tunnelHost;
	version.app.redirect_uri = utils.buildRedirectUrl(tunnelHost);
	version.version = `0.0.0-${hash(version)}`;

	const clientSecret = utils.getClientSecret() || await utils.createClientSecret();

	const vendorId = version.vendor_id;
	const appId = version.app_id;
	const appUrl = tunnelHost;

	try {
		const appData = await api.getApp(auth, { appId, vendorId });
		const app = templates.app({ appId, clientSecret, appUrl, oldVersion: appData.CurrentVersion });
		await api.saveApp(auth, { app, vendorId });
		await utils.writeManifest(version);
		await api.releaseVersion(auth, { version });
	} catch (e) {
		return Promise.reject(e);
	}

	return Promise.resolve();
}

function getFullAppName(manifest) {
	return `${manifest.vendor_id}.${manifest.app_id}`;
}

module.exports = { generateManifest, updateManifest, getFullAppName };
