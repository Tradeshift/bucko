var _ = require('LoDash');
var express = require('express');

var router = express.Router();

router.get('/', function(request, response) {
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
