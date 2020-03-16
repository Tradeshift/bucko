require('dotenv').config();

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const execa = require('execa');
const { updateManifest, getFullAppName } = require('./helpers/manifest');

if (!fs.existsSync(path.resolve(__dirname, '../manifest.json'))) {
	console.log(`${chalk.red('There is a problem!')} Looks like you did not create a manifest. Run ${chalk.yellow('npm run create-app')} and then try again`);
	process.exit(1);
}

const manifest = require('../manifest.json'); // eslint-disable-line import/no-unresolved

const PORT = process.env.PORT || 8443;

const env = {
	APP_HOST: `https://localhost:${PORT}`,
	APP_CLIENT_ID: getFullAppName(manifest),
	PORT,
};

(async function start() {
	await updateManifest(manifest, `${env.APP_HOST}/`);
	// start up node server to handle requests
	execa(`${process.cwd()}/node_modules/nodemon/bin/nodemon.js`, ['src/server.js'], { env }).stdout.pipe(process.stdout);
}());
