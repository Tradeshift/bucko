var express = require('express');
var https = require('https');
var Q = require('q');

var config = require('../config').get();

var router = express.Router();

function getToken(request, response) {
	var url = [
			'{authLoginUri}',
			'?response_type=code',
			'&client_id={clientId}',
			'&redirect_uri={redirectUri}',
			'&scope=openid offline',
		]
		.join('')
		.replace('{authLoginUri}', config.getTradeshiftAuthLoginUri())
		.replace('{clientId}', config.getClientId())
		.replace('{redirectUri}', config.getAuthCallbackUri());
	console.log('Redirecting to', url, 'for authentication');
	response.redirect(url);
}

function authCallback(request, response) {
	var authCode = request.query.code;
	if (!authCode) {
		var message = 'Oh snap! Unable to authenticate with Tradeshift.';
		console.warn(message);
		response.status(400).send(message);
		return;
	}

	console.log('Received authentication code', authCode);

	resolveTokens(authCode).then(function(result) {
		var idToken = result.id_token.split('.')[1];
		var decodedIdToken = new Buffer(idToken, 'base64').toString('utf8');
		var parsedIdToken = JSON.parse(decodedIdToken);
		request.session.auth = {
			accessToken: result.access_token,
			companyId: parsedIdToken.companyId,
			rawAuthResponse: result,
			refreshToken: result.refresh_token,
			userId: parsedIdToken.userId,
			username: parsedIdToken.sub,
		};
		console.log('Authentication response', JSON.stringify(result, null, '\t'));
		console.log('Authenticated as user', parsedIdToken.userId, 'in company', parsedIdToken.companyId);
		response.redirect('/');
	}).catch(function(error) {
		var message = 'Oh snap! Error resolving authentication tokens.';
		console.warn(message, error);
		response.status(500).send(message);
	}).done();
}

function resolveTokens(authCode) {
	return Q.Promise(function(resolve, reject) {
		var options = {
			hostname: config.getTradeshiftHost(),
			path: config.getTradeshiftAuthTokenPath(),
			method: 'POST',
			auth: [config.getClientId(), ':', config.getAuthSecret()].join(''),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		};
		var request = https.request(options, function(response) {
			var data = [];
			response.setEncoding('utf8');
			response.on('data', function(chunk) {
				data.push(chunk);
			});
			response.on('end', function() {
				var body = JSON.parse(data.join(''));
				console.log('Response with access token', body);
				resolve(body);
			});
		});
		request.on('error', function(error) {
			console.warn('Oh snap! request.on error', error);
			reject(error);
		});
		request.write([
				'grant_type=authorization_code',
				'code={authCode}',
				'scope={scope}',
			]
			.join('&')
			.replace('{grantType}', 'authorization_code')
			.replace('{authCode}', authCode)
			.replace('{scope}', config.getClientIdWithVersion())
		);
		request.end();
	});
}

router.get('/token', getToken);
router.get('/callback', authCallback);

module.exports = router;
