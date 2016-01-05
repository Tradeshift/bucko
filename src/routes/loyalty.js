var express = require('express');

var tradeshift = require('../services/TradeshiftAPIClient');

var router = express.Router();

router.post('/document/:documentId/thank', function(request, response) {
	var documentId = request.params.documentId;
	var documentReferenceNumber = request.body.businessId;
	var message = request.body.message;
	// post comment
	// add document tag
	console.log('thanking', documentId, documentReferenceNumber, message);
	response.status(200).end();
});

router.post('/document/:documentId/dismiss', function(request, response) {
	var documentId = request.params.documentId;
	// add document tag
	console.log('dismissing', documentId);
	response.status(200).end();
});

router.get('/customers', function(request, response) {
	var data = tradeshift.getCustomers();
	response.status(200).send(data);
});

module.exports = router;
