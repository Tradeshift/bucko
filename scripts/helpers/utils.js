const dockerNames = require('docker-names');
const fs = require('fs');
const { promisify } = require('util');
const uuid = require('uuid/v4');

const appendFileAsync = promisify(fs.appendFile);
const writeFileAsync = promisify(fs.writeFile);

const apiUrlToProductUrl = tsApiHost => tsApiHost.replace('api-', '').replace('/tradeshift/rest/external', '');

const buildAppStoreUrl = ({ appId, tsApiHost, vendorId }) =>
	`${apiUrlToProductUrl(tsApiHost)}/#/apps/Tradeshift.AppStore/apps/${vendorId}.${appId}`;

const buildAppEmbedUrl = ({ appId, tsApiHost, vendorId }) =>
	`${apiUrlToProductUrl(tsApiHost)}/#/apps/${vendorId}.${appId}`;

const buildAppUrl = ({ appId, host, vendorId }) =>
	`https://${vendorId.toLowerCase()}${appId.toLowerCase()}.${host}/`;

const buildRedirectUrl = host => `${host}auth/callback`;

const convertAppNameToId = appName => appName.replace(/\s/g, '');

const generateAppName = () => dockerNames.getRandomName()
	.split('_')
	.map(string => string[0].toUpperCase() + string.slice(1))
	.join(' ');

const writeManifest = async version =>
	writeFileAsync(`${process.cwd()}/manifest.json`, JSON.stringify(version, null, 2));

const writeClientSecret = async clientSecret =>
	appendFileAsync(`${process.cwd()}/.env`, `APP_OAUTH_SECRET=${clientSecret}`);

const getClientSecret = () => process.env.APP_OAUTH_SECRET;

const createClientSecret = async () => {
	const clientSecret = uuid();
	await writeClientSecret(clientSecret);
	return clientSecret;
};

const getAuth = () => ({
	companyId: process.env.TS_COMPANY_ID,
	consumerKey: process.env.TS_CONSUMER_KEY,
	consumerSecret: process.env.TS_CONSUMER_SECRET,
	token: process.env.TS_TOKEN,
	tokenSecret: process.env.TS_TOKEN_SECRET,
	tsApiHost: process.env.TS_API_HOST,
});

module.exports = {
	buildAppEmbedUrl,
	buildAppStoreUrl,
	buildAppUrl,
	buildRedirectUrl,
	convertAppNameToId,
	createClientSecret,
	generateAppName,
	getAuth,
	getClientSecret,
	writeClientSecret,
	writeManifest,
};
