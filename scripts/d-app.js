const execa = require('execa');
const { LocalOut } = require('share-localhost');
const chalk = require('chalk');

const PORT = process.env.PORT || 3043;

function openTunnel(port) {
	const context = new LocalOut({ port });

	return context
		.connect()
		.then((connectionData) => {
			const host = `https://${connectionData.hostname}`;
			console.log(chalk.green(`Started tunnel from ${host} to http://localhost:${port}`));
			return { host, port };
		});
}

openTunnel(PORT)
	.then((urlConfig) => {
		const env = { PORT: urlConfig.port };
		// start up node server to handle requests
		execa(`${process.cwd()}/node_modules/nodemon/bin/nodemon.js`, ['src/server.js'], { env }).stdout.pipe(process.stdout);
	})
	.catch((err) => {
		console.log(chalk.red('Error creating tunnel'));
		console.log(err);
		process.exit(1);
	});
