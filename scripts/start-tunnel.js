const chalk = require('chalk');
const { createTunnel } = require('./helpers/tunnel');

const PORT = process.env.PORT || 8443;
const TUNNEL_TOKEN = process.env.NGROK_TOKEN;

if (!TUNNEL_TOKEN) {
	console.log(`${chalk.red('There is a problem!')} Looks like you did not provide tunnel token. Please check the NGROK_TOKEN exists in the environment variables`);
	process.exit(1);
}

(async function runTunnel() {
	try {
		await createTunnel(PORT, TUNNEL_TOKEN);
	} catch (err) {
		console.log(chalk.red('An error occurred while starting the application'), err);
		process.exit(1);
	}
}());
