require('dotenv').config();

const execa = require('execa');
const { updateManifest, getFullAppName } = require('./helpers/manifest');
const manifest = require('../manifest.json'); // eslint-disable-line import/no-unresolved

const PORT = process.env.PORT || 3043;

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
