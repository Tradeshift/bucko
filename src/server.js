require('dotenv').config();

const https = require('https');
const path = require('path');
const fs = require('fs');
const app = require('./app');

const PORT = process.env.PORT || 8443;

const cert = path.resolve(__dirname, '../certs/localhost');

https.createServer(
	{
		cert: fs.readFileSync(`${cert}.cert`),
		key: fs.readFileSync(`${cert}.key`),
	},
	app.callback(),
).listen(PORT, (err) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`We're up and running at https://localhost:${PORT}`);
});
