var express = require('express');

var TradeshiftAPIClient = require('../services/TradeshiftAPIClient');

var router = express.Router();

router.post('/document/:documentReferenceId/thank', function(request, response) {
	var documentReferenceId = request.params.documentReferenceId;
	var documentReferenceNumber = request.body.businessId;
	var message = request.body.message;

	console.log('thanking', documentReferenceId, documentReferenceNumber, message);

	var ts = new TradeshiftAPIClient(request.session.auth.accessToken);
	ts.addCommentToDocument({
		documentReferenceId: documentReferenceId,
		documentReferenceNumber: documentReferenceNumber,
		message: message,
	}).then(function(result) {
		return ts.addTagToDocument({
			documentId: documentReferenceId,
			tag: 'loyalty',
		});
	}).then(function(result) {
		response.status(200).send(result);
	}).catch(function(error) {
		console.log('error is', error);
		response.status(500).send(error);
	}).done();
});

router.post('/document/:documentId/dismiss', function(request, response) {
	var documentId = request.params.documentId;
	// add document tag
	console.log('dismissing', documentId);
	response.status(200).end();
});

router.get('/customers', function(request, response) {
	var ts = new TradeshiftAPIClient(request.session.auth.accessToken);
	ts.getCustomerCounts().then(function(data) {
		response.status(200).send(data);
	});
});

module.exports = router;
