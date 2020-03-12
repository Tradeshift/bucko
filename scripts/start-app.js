const chalk = require('chalk');
const execa = require('execa');
const localtunnel = require('localtunnel');
const { getFullAppName } = require('./helpers/manifest');
const manifest = require('../manifest.json'); // eslint-disable-line import/no-unresolved

const PORT = process.env.PORT || 3043;
const TUNNEL_DOMAIN = 'localtunnel.me';

const appUrl = manifest.app.main;
const clientId = getFullAppName(manifest);
const subdomain = clientId.toLowerCase().replace('.', '');

if (appUrl.indexOf(TUNNEL_DOMAIN) === -1) {
	console.log(chalk.red(`Error: The host in manifest.json (${appUrl}) does not match the proxy service (${TUNNEL_DOMAIN}).`));
	process.exit(1);
}

const tunnel = localtunnel(PORT, { subdomain }, (err, { url }) => {
	if (err) {
		console.log(chalk.red(`Error creating tunnel for subdomain ${subdomain}`));
		console.log(err);
		process.exit(1);
	}
	console.log(chalk.green(`Started tunnel from ${url} to http://localhost:${PORT}`));

	// set some environment variables for the app
	const env = {
		APP_HOST: appUrl.slice(0, -1), // remove the trailing /
		APP_CLIENT_ID: clientId,
		PORT,
	};

	// start up node server to handle requests
	execa(`${process.cwd()}/node_modules/nodemon/bin/nodemon.js`, ['src/server.js'], { env }).stdout.pipe(process.stdout);
});
tunnel.on('close', () => {
	console.log(chalk.red('Tunnel closed'));
	process.exit(1);
});
tunnel.on('error', (err) => {
	console.log(chalk.red('Error on tunnel, closing'));
	console.log(err);
	process.exit(1);
});
