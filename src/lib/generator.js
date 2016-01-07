var _ = require('lodash');
var Mockaroo = require('mockaroo');
var moment = require('moment');
var Q = require('q');
var uuid = require('node-uuid');

var UBL = require('./UBL');

var client;

function getClient() {
	if (!client) {
		client = new Mockaroo.Client({
			apiKey: '32a625e0'
		});
	}
	return client;
}

function onError(error) {
	if (error instanceof Mockaroo.errors.InvalidApiKeyError) {
		console.log('invalid api key');
	} else if (error instanceof Mockaroo.errors.UsageLimitExceededError) {
		console.log('usage limit exceeded');
	} else {
		console.log('unknown error', error);
	}
}

function generateCompanyNames(count) {
	return getClient().generate({
		count: count,
		fields: [{
			name: 'companyName',
			type: 'Company Name'
		}],
	}).then(function(records) {
		console.log('Generated', count, 'records:', records);
		return records;
	}).catch(onError);
}

function generateInvoices(options) {
	// TODO: do I need to make a call to get account info for this?!
	options.companyName = 'Developer';

	return Q(_.times(options.count, function() {
		var connection = _.first(_.sample(options.connections, 1));
		console.log('Generating document for connection', connection);

		return {
			connectionId: connection.ConnectionId,
			documentContent: UBL.invoice({
				businessId: _.random(1000, 9999),
				currencyCode: 'USD',
				issueDate: moment().subtract(_.random(0, 90), 'days').format('YYYY-MM-DD'),
				payableAmount: _.random(200, 20000),
				receiverCompanyName: connection.CompanyName,
				receiverEmail: connection.Email,
				senderCompanyId: options.companyId,
				senderCompanyName: options.companyName,
				senderUserId: options.userId,
			}),
			documentId: uuid.v4(),
			documentProfileId: 'ubl.invoice.2.1.us',
		};
	}));
}

function generateDocumentStateChanges(options) {
	return Q(_.times(_.min([options.count, _.size(options.documents)]), function() {
		var doc = _.first(_.sample(options.documents, 1));
		var documentId = uuid.v4();
		return {
			documentContent: UBL.applicationResponse({
				documentId: documentId,
				documentReferenceId: doc.documentId,
				documentReferenceNumber: doc.documentNumber,
				issueDate: moment(doc.issueDate).add(7, 'days').format('YYYY-MM-DD'),
				message: 'Gotta get paid!',
				responseCode: 'BusinessPaid',
			}),
			documentId: documentId,
		};
	}));
}

module.exports = {
	companyNames: generateCompanyNames,
	documentStateChanges: generateDocumentStateChanges,
	invoices: generateInvoices,
};
