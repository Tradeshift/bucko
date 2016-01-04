var express = require('express');
var https = require('https');
var Q = require('q');

var config = require('../config').get();

var router = express.Router();

router.get('/info', function(req, res) {
	getAccountInfo(req.session.auth.accessToken).then(function(result) {
		res.status(200).send(result);
	}).catch(function(error) {
		res.status(500).send(error);
	}).done();
});

function getAccountInfo(accessToken) {
	return Q.Promise(function(resolve, reject) {
		var options = {
			hostname: config.getTradeshiftHost(),
			path: '/tradeshift/rest/external/account/info',
			headers: {
				'Accept': 'application/json',
				'Authorization': ['Bearer', accessToken].join(' '),
			},
		};
		console.log('making request with options', options);
		https.get(options, function(response) {
			var data = [];
			response.on('data', function(chunk) {
				data.push(chunk);
			});
			response.on('end', function() {
				try {
					var body = JSON.parse(data.join(''));
					resolve(body);
				} catch (error) {
					console.log('Oh snap! on parse', error);
					reject(error);
				}
			});
		}).on('error', function(error) {
			console.log('Oh snap! on error', error);
			reject(error);
		});
	});
}

module.exports = router;
