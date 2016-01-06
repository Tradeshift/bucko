var _ = require('lodash');
var fs = require('fs-extra');
var path = require('path');
var Q = require('q');
var request = require('superagent');
var url = require('url');
var uuid = require('node-uuid');

var UBL = require('../lib/UBL');
var config = require('../config').get();

function getDocumentItemInfoValue(itemInfos, property) {
	return _.result(_.find(itemInfos, { type: property }), 'value');
}
function getPaymentDate(conversationStates) {
	return _.result(_.find(conversationStates, { State: 'OTHER_PAID' }), 'Timestamp');
}

function TradeshiftAPIClient(accessToken) {
	this._accessToken = accessToken;
}

TradeshiftAPIClient.prototype = {
	_request: function(options) {
		var that = this;
		options = options || {};
		return Q.Promise(function(resolve, reject) {
			var path = url.resolve(config.getTradeshiftApiUri(), options.path);
			var req = request(options.method || 'GET', path)
				.set('Accept', options.accept || 'application/json')
				.set('Content-Type', options.contentType || 'application/json')
				.set('Authorization', ['Bearer', that._accessToken].join(' '))
				.on('error', function(err, res) {
					console.log('Oh snap! Error making request to', path, err, res);
					reject(err);
				});
			if (!_.isEmpty(options.query)) {
				req.query(options.query);
			}
			if (!_.isEmpty(options.data)) {
				req.send(options.data);
			}
			req.end(function(error, result) {
				resolve(result.body);
			});
		});
	},
	getCustomerCounts: function(isLocal) {
		if (isLocal || !isLocal) {
			var file = path.resolve(__dirname, '../../data/customerCounts.json');
			return Q(fs.readJsonSync(file));
		}
	},
	getCustomers: function(isLocal) {
		if (isLocal || !isLocal) {
			var file = path.resolve(__dirname, '../../data/customers.json');
			return Q(fs.readJsonSync(file));
		}
	},
	getRecentPaidInvoices: function(isLocal) {
		if (isLocal) {
			var file = path.resolve(__dirname, '../../data/documents.json');
			return Q(fs.readJsonSync(file));
		}

		return this._request({
			method: 'GET',
			path: 'documents',
			query: {
				_onlyIndex: true,
				ascending: false,
				limit: 100,
				ordering: 'LastEdit',
				page: 0,
				sales: true,
				state: ['PAID_UNCONFIRMED', 'PAID_CONFIRMED'],
				type: 'invoice',
				withouttag: 'loyalty',
			},
		}).then(function(result) {
			console.log('got back some stuff on documents', result);
			return _.map(result.Document, function(doc) {
				return {
					documentId: doc.DocumentId,
					customerName: doc.SenderCompanyName,
					documentType: doc.DocumentType.type,
					documentNumber: doc.ID,
					datePaid: getPaymentDate(doc.ConversationStates),
					issueDate: getDocumentItemInfoValue(doc.ItemInfos, 'document.issuedate'),
					currency: getDocumentItemInfoValue(doc.ItemInfos, 'document.currency'),
					amount: getDocumentItemInfoValue(doc.ItemInfos, 'document.total'),
					isThanked: false
				};
			});
		});
	},
	addCommentToDocument: function(options) {
		var documentId = uuid.v4();
		var applicationResponse = UBL.applicationResponse({
			documentId: documentId,
			documentReferenceId: options.documentReferenceId,
			documentReferenceNumber: options.documentReferenceNumber,
			message: options.message,
			responseCode: 'BusinessMessage',
		});
		console.log('adding', options.message, 'to', documentId, ' : ', options.documentReferenceNumber);
		return this.sendDocument({
			documentContent: applicationResponse,
			documentId: documentId,
			documentProfileId: 'tradeshift.status.1.0',
		});
	},
	addTagToDocument: function(options) {
		console.log('tagging document', options.documentId, 'with', options.tag);
		return this._request({
			method: 'PUT',
			path: ['documents', options.documentId, 'tags', options.tag].join('/'),
		});
	},
	sendDocument: function(options) {
		console.log('sending document', options.documentId, 'with contents', options.documentContent);
		return this._request({
			data: options.documentContent,
			method: 'PUT',
			path: ['documents', options.documentId].join('/'),
			query: {
				documentProfileId: options.documentProfileId,
			},
		});
	},
};

module.exports = TradeshiftAPIClient;
