require('dotenv').config();

const api = require('./helpers/ts-api');
const chalk = require('chalk');
const templates = require('./helpers/templates');
const utils = require('./helpers/utils');

const TUNNEL_DOMAIN = 'localtunnel.me';

const logSuccess = ({ appName, appEmbedUrl, appStoreUrl }) => {
	console.log(`
 🚀  ${chalk.green('Success!')} You're app has been created and released on Tradeshift:\n
      App Name: ${appName}
      App URL: ${chalk.underline.blue(appEmbedUrl)}\n\n
 🤜  Activate your app from the Tradeshift Appstore so you can work with it:\n
      Appstore URL: ${chalk.underline.blue(appStoreUrl)}\n\n
 💫  Start the server - along with the tunnel - so requests for your app are redirected to your local server:\n
      ${chalk.cyan('npm run start-app')}\n\n
 Happy coding!\n\n 👩‍💻  🤖  👨‍💻\n`);
};

// need to wrap and call so we can use async / await
(async function createApp() {
	const auth = utils.getAuth();

	const vendor = await api.getVendor(auth);
	const vendorId = vendor.VendorId;

	const clientSecret = utils.getClientSecret() || await utils.createClientSecret();

	const appName = utils.generateAppName();
	const appId = utils.convertAppNameToId(appName);
	const appUrl = utils.buildAppUrl({ appId, host: TUNNEL_DOMAIN, vendorId });

	const app = templates.app({ appId, clientSecret, appUrl });
	const version = templates.appVersion({ appId, appName, appUrl, vendorId });

	try {
		await api.saveApp(auth, { app, vendorId });
		await utils.writeManifest(version);
		await api.releaseVersion(auth, { version });
	} catch (e) {
		console.log(`${chalk.red('Oh snap!')} There was a problem creating the app.`);
		console.log(e);
		process.exit(1);
	}

	const { tsApiHost } = auth;
	const appEmbedUrl = utils.buildAppEmbedUrl({ appId, tsApiHost, vendorId });
	const appStoreUrl = utils.buildAppStoreUrl({ appId, tsApiHost, vendorId });
	logSuccess({ appName, appEmbedUrl, appStoreUrl });
}());
