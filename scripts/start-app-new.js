require('dotenv').config();

const execa = require('execa');
const { LocalOut } = require('share-localhost');
const chalk = require('chalk');
const { updateManifest, getFullAppName } = require('./helpers/manifest');

const manifest = require('../manifest.json'); // eslint-disable-line import/no-unresolved

const PORT = process.env.PORT || 3043;

function openTunnel(port) {
	const context = new LocalOut({ port });

	return context
		.connect()
		.then((connectionData) => {
			const host = `https://${connectionData.hostname}/`;
			console.log(chalk.green(`Started tunnel from ${host} to http://localhost:${port}/`));
			return { host, port };
		});
}

openTunnel(PORT)
	.then(async (urlConfig) => {
		// set some environment variables for the app
		const env = {
			APP_HOST: urlConfig.host.slice(0, -1), // remove the trailing /
			APP_CLIENT_ID: getFullAppName(manifest),
			PORT,
		};
		await updateManifest(manifest, urlConfig.host);
		// start up node server to handle requests
		execa(`${process.cwd()}/node_modules/nodemon/bin/nodemon.js`, ['src/server.js'], { env }).stdout.pipe(process.stdout);
	})
	.catch((err) => {
		console.log(chalk.red('Error creating tunnel'));
		console.log(err);
		process.exit(1);
	});
