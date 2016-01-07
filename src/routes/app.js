var _ = require('lodash');
var express = require('express');
var Q = require('q');
var url = require('url');

var TradeshiftAPIClient = require('../services/TradeshiftAPIClient');

var config = require('../config').get();
var router = express.Router();

router.get('/', function(request, response) {
	var isLocal = config.isLocalDevelopment();
	var isAuthenticated = !_.isEmpty(request.session.auth);

	if (!isAuthenticated && !isLocal) {
		response.redirect('/auth/token');
		return;
	}

	if (isLocal) {
		request.session.auth = {
			accessToken: 'fakeAccessToken',
			companyId: 'fakeCompanyId',
			userId: 'fakeUserId',
			username: 'me!',
		};
	}

	var ts = new TradeshiftAPIClient(request.session.auth.accessToken);

	Q.all([
		ts.getRecentPaidInvoices(isLocal),
		ts.getCustomers(isLocal),
	]).spread(function(docs, customers) {
		response.status(200).render('sections', {
			auth: {
				companyId: request.session.auth.companyId,
				userId: request.session.auth.userId,
				username: request.session.auth.username,
			},
			customers: customers,
			documents: docs,
			globals: JSON.stringify({
				host: url.format({
					protocol: config.isLocalDevelopment() ? 'http' : 'https',
					hostname: request.hostname,
					port: config.isLocalDevelopment() ? request.app.get('port') : '',
				}),
			}),
		});
	});
});

module.exports = router;
