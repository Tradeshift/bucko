require('dotenv').config();

const http = require('http');
const app = require('./app');

const PORT = process.env.PORT || 3001;

http.createServer(app.callback()).listen(PORT, async (err) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`We're up and running at http://localhost:${PORT}`);
});
