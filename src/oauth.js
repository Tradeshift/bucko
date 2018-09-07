const axios = require('axios');
const Koa = require('koa');
const Router = require('koa-router');
const manifest = require('../manifest.json');

const app = new Koa();
const router = new Router();

const TS_URL_BASE = 'https://api-smoketest.eu-west-1.test.ts.sv';
const TS_URL_LOGIN = `${TS_URL_BASE}/tradeshift/auth/login`;
const TS_URL_TOKEN = `${TS_URL_BASE}/tradeshift/auth/token`;

const clientId = `${manifest.vendor_id}.${manifest.app_id}`;

// Step 1: when a user opens the app, they hit the endpoint specified as `app.main` the manifest
router.get('/', async (ctx) => {
	const redirectUri = manifest.app.redirect_uri;

	// Step 2: our app redirects to the oauth login endpoint on Tradeshift to kick off the oauth flow
	const url = `${TS_URL_LOGIN}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid offline`;
	console.log(`Redirecting to ${url} for authentication`);
	ctx.redirect(url);
});

// Step 3: Tradeshift calls the endpoint specified as `app.redirect_uri` in the manifest
router.get('/auth/callback', async (ctx) => {
	// the authorization code is sent to our app as a query param
	const authCode = ctx.query.code;
	if (!authCode) {
		throw new Error('Missing code');
	}

	const clientIdWithVersion = `${clientId}.${manifest.version}`;
	const auth = Buffer.from(`${clientId}:${process.env.APP_OAUTH_SECRET}`).toString('base64');

	// Step 4: our app uses the authorization code to request the access token
	const response = await axios.request({
		data: `grant_type=authorization_code&code=${authCode}&scope=${clientIdWithVersion}`,
		method: 'POST',
		url: TS_URL_TOKEN,
		headers: {
			Authorization: `Basic ${auth}`,
			accept: 'application/json',
			'content-type': 'application/x-www-form-urlencoded',
		},
	});

	// Step 5: parse the response to get the good stuff
	const idToken = response.data.id_token.split('.')[1];
	const decodedIdToken = JSON.parse(Buffer.from(idToken, 'base64').toString('utf8'));

	console.log(`Authenticated as user ${decodedIdToken.userId} in company ${decodedIdToken.companyId}`);
	ctx.status = 200;
	ctx.body = JSON.stringify({ decoded: decodedIdToken, response: response.data }, null, '\t');
});

// add routes to the app
app.use(router.routes());

module.exports = app;
