const axios = require('axios');
const chalk = require('chalk');

const api = {};

const getClient = (ctx) => {
	const token = ctx && ctx.state && ctx.state.user && ctx.state.user.accessToken;

	if (!token) {
		throw new Error('Missing authentication - unable to make an API request.');
	}

	const instance = axios.create({
		baseURL: `${process.env.TS_API_HOST}`,
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	// log requests to tradeshift api
	instance.interceptors.request.use((config) => {
		console.log(`${chalk.cyan('Tradeshift API')}: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
		return config;
	});

	// just pass back `data` for simplicity
	instance.interceptors.response.use((response) => (
		response.status === 200 ? response.data : response));

	return instance;
};

api.getAccount = async (ctx) => getClient(ctx).get('/account/info');

module.exports = api;
