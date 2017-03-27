var _ = require('lodash');
var express = require('express');
var Q = require('q');

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

	Q.all([
		ts.getInvoices(),
		ts.getConnections(),
	]).spread(function(docs, connections) {
		_.forEach(connections, function(connection) {
			_.assign(connection, {
				documents: [],
			});
		});
		_.forEach(docs, function(doc) {
			var connection = _.find(connections, function(connection) {
				return connection.CompanyName === doc.customerName;
			});
			connection.documents.push(doc);
		});
		var data = _.chain(connections)
			.map(function(connection) {
				return {
					connectionId: connection.ConnectionId,
					companyName: connection.CompanyName,
					isReminded: false,
					purchaseCount: _.size(connection.documents),
					lastPurchase: _.max(connection.documents, function(doc) {
						return doc.issueDate.replace(/-/g, '');
					}),
				};
			})
			.filter(function(connection) {
				return !_.isEmpty(connection.lastPurchase);
			})
			.sortBy(function(connection) {
				return connection.lastPurchase.issueDate.replace(/-/g, '');
			})
			.value();
		response.status(200).send(data);
	}).catch(function(error) {
		console.log('Oh snap! Error building connection documents', error);
		response.status(500).send({
			message: error,
		});
	});
});

module.exports = router;
