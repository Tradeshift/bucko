const request = require('request-promise-native');

class TSAPIError extends Error {
	constructor(...args) {
		super(...args);
		this.name = this.constructor.name;
		Error.captureStackTrace(this, TSAPIError);
	}
}

const doRequest = async (auth, { body, method = 'GET', url }) => {
	const options = {
		body,
		gzip: true,
		headers: {
			'user-agent': 'bucko-app',
			'x-tradeshift-tenantid': auth.companyId,
		},
		json: true,
		method,
		oauth: {
			consumer_key: auth.consumerKey,
			consumer_secret: auth.consumerSecret,
			token: auth.token,
			token_secret: auth.tokenSecret,
		},
		url: `${auth.tsApiHost}${url}`,
	};
	try {
		return await request(options);
	} catch (e) {
		console.log(`Request to ${options.method} ${options.url} returned ${e.statusCode}`);
		throw new TSAPIError(e);
	}
};

const getAccount = async auth =>
	doRequest(auth, { url: '/account/info/user' });

const getVendor = async auth =>
	doRequest(auth, { url: `/apps/company/${auth.companyId}/vendor` });

const releaseVersion = async (auth, { version }) =>
	doRequest(auth, { body: version, method: 'POST', url: '/apps/release' });

const saveApp = async (auth, { app, vendorId }) =>
	doRequest(auth, { body: app, method: 'PUT', url: `/apps/vendors/${vendorId}/apps/${app.AppId}` });

module.exports = {
	getAccount,
	getVendor,
	releaseVersion,
	saveApp,
};
