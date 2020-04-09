require('dotenv').config();

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const execa = require('execa');
const { updateManifest, getFullAppName } = require('./helpers/manifest');
const { createTunnel } = require('./helpers/tunnel');

if (!fs.existsSync(path.resolve(__dirname, '../manifest.json'))) {
	console.log(`${chalk.red('There is a problem!')} Looks like you did not create a manifest. Run ${chalk.yellow('npm run create-app')} and then try again`);
	process.exit(1);
}

const manifest = require('../manifest.json'); // eslint-disable-line import/no-unresolved

const PORT = process.env.PORT || 8443;
const TUNNEL_TOKEN = process.env.NGROK_TOKEN;

if (!TUNNEL_TOKEN) {
	console.log(`${chalk.red('There is a problem!')} Looks like you did not provide tunnel token. Please check the NGROK_TOKEN exists in the environment variables`);
	process.exit(1);
}

(async function runApp() {
	try {
		const host = await createTunnel(PORT, TUNNEL_TOKEN);
		const clientId = getFullAppName(manifest); // clientId equals to full app name
		await updateManifest(manifest, `${host}/`);
		const env = {
			APP_HOST: host,
			APP_CLIENT_ID: clientId,
			PORT,
		};

		// start up node server to handle requests
		execa(`${process.cwd()}/node_modules/nodemon/bin/nodemon.js`, ['src/server.js'], { env }).stdout.pipe(process.stdout);
	} catch (err) {
		console.log(chalk.red('An error occurred while starting the application'), err);
		process.exit(1);
	}
}());
