var _ = require('lodash');
var express = require('express');

var tradeshift = require('../services/TradeshiftAPIClient');

var config = require('../config').get();
var router = express.Router();

router.get('/', function(request, response) {
	if (config.isLocalDevelopment()) {
		response.status(200).render('sections', {
			auth: {
				username: 'Me!',
				companyId: 'fakeCompanyId',
				userId: 'fakeUserId',
			},
			customers: tradeshift.getCustomers(),
			documents: tradeshift.getRecentPaidInvoices(),
		});
		return;
	}

	if (_.isEmpty(request.session.auth)) {
		response.redirect('/auth/token');
	} else {
		response.status(200).render('sections', {
			auth: {
				companyId: request.session.auth.companyId,
				userId: request.session.auth.userId,
				username: request.session.auth.username,
			},
		});
	}
});

module.exports = router;
