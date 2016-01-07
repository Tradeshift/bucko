var _ = require('lodash');
var express = require('express');
var Q = require('q');

var config = require('../config').get();
var connection = require('../lib/Connection');
var TradeshiftAPIClient = require('../services/TradeshiftAPIClient');

var router = express.Router();
var generator = require('../lib/generator');

router.post('/connections', function(request, response) {
	console.log('Generating connections');
	var ts = new TradeshiftAPIClient(request.session.auth.accessToken);

	generator.companyNames(2).then(function(records) {
		var promises = _.map(records, function(record) {
			return ts.sendConnectionRequest({
				connection: connection.createRequest({
					companyName: record.companyName,
					tradeshiftHost: config.getTradeshiftHost(),
				}),
			});
		});
		return Q.allSettled(promises);
	}).then(function(results) {
		var count = _.chain(results)
			.filter(Q.isFulfilled)
			.size()
			.value();
		response.status(200).send({
			message: ['Created', count, 'connections'].join(' '),
		});
	}).catch(function(error) {
		console.log('Oh snap! Error generating connections', error);
		response.status(500).send({
			message: error,
		});
	});
});

router.post('/documents', function(request, response) {
	console.log('Generating documents');
	var ts = new TradeshiftAPIClient(request.session.auth.accessToken);

	ts.getConnections().then(function(connections) {
		return generator.invoices({
			count: 2,
			connections: connections,
			companyId: request.session.auth.companyId,
			userId: request.session.auth.userId,
		});
	}).then(function(invoices) {
		console.log('invoices', invoices);
		var promises = _.map(invoices, function(invoice) {
			return ts.dispatchDocument({
				documentId: invoice.documentId,
				documentContent: invoice.documentContent,
				documentProfileId: invoice.documentProfileId,
				connectionId: invoice.connectionId,
			});
		});
		return Q.allSettled(promises);
	}).then(function(results) {
		var count = _.chain(results)
			.filter(Q.isFulfilled)
			.size()
			.value();
		response.status(200).send({
			message: ['Created', count, 'documents'].join(' '),
		});
	}).catch(function(error) {
		console.log('Oh snap! Error generating documents', error);
		response.status(500).send({
			message: error,
		});
	});
});

router.post('/documents/payments', function(request, response) {
	console.log('Generating payments');
	var ts = new TradeshiftAPIClient(request.session.auth.accessToken);

	ts.getRecentUnpaidInvoices().then(function(documents) {
		return generator.documentStateChanges({
			count: 2,
			documents: documents,
		});
	}).then(function(stateChanges) {
		console.log('stateChanges', stateChanges);
		return Q.allSettled(_.map(stateChanges, function(stateChange) {
			return ts.changeDocumentState({
				documentContent: stateChange.documentContent,
				documentId: stateChange.documentId,
			});
		}));
	}).then(function(results) {
		var count = _.chain(results)
			.filter(Q.isFulfilled)
			.size()
			.value();
		response.status(200).send({
			message: ['Received', count, 'payments'].join(' '),
		});
	}).catch(function(error) {
		console.log('Oh snap! Error generating documents', error);
		response.status(500).send({
			message: error,
		});
	});
});

module.exports = router;
