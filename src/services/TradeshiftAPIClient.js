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
			var base = [config.getTradeshiftApiUri(), '/'].join('');
			var path = url.resolve(base, options.path);
			console.log('Will make request to', path);
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
			req.end(function(error, response) {
				//console.log('Tradeshift request finished', path, response.text, response.status, error);
				resolve(response.body);
			});
		});
	},
	getCustomerCounts: function(isLocal) {
		if (isLocal) {
			var file = path.resolve(__dirname, '../../data/customerCounts.json');
			return Q(fs.readJsonSync(file));
		}
		return Q.all([
			this.getInvoices(),
			this.getConnections(),
		]).spread(function(docs, connections) {
			console.log('back with connections', connections);
			_.forEach(connections, function(connection) {
				console.log('first', connection.ConnectionId);
				_.assign(connection, {
					documents: [],
				});
			});
			_.forEach(docs, function(doc) {
				console.log('second', doc.documentId);
				var connection = _.find(connections, function(connection) {
					return connection.CompanyName === doc.customerName;
				});
				console.log('the abusing document is', doc);
				console.log('third', connection.ConnectionId);
				connection.documents.push(doc);
			});
			console.log("Hellooooo",connections)
			return _.chain(connections)
				.map(function(connection) {
					return {
						connectionId: connection.ConnectionId,
						customerName: connection.CompanyName,
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
			});
	},
	getCustomers: function(isLocal) {
		if (isLocal || !isLocal) {
			var file = path.resolve(__dirname, '../../data/customers.json');
			return Q(fs.readJsonSync(file));
		}
	},
	getAccountInfo: function() {
		return this._request({
			path: ['account', 'info'].join('/'),
		});
	},
	getInvoices: function(isLocal) {
		if (isLocal) {
			return Q.reject('Not implemented in local environment');
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
				type: 'invoice',
			},
		}).then(function(result) {
			//console.log('got back some stuff on documents', result);
			return _.map(result.Document, function(doc) {
				return {
					documentId: doc.DocumentId,
					customerName: doc.ReceiverCompanyName,
					datePaid: getPaymentDate(doc.ConversationStates),
					documentType: doc.DocumentType.type,
					documentNumber: doc.ID,
					issueDate: getDocumentItemInfoValue(doc.ItemInfos, 'document.issuedate'),
					currency: getDocumentItemInfoValue(doc.ItemInfos, 'document.currency'),
					amount: getDocumentItemInfoValue(doc.ItemInfos, 'document.total'),
					isThanked: false
				};
			});
		});
	},
	getRecentUnpaidInvoices: function(isLocal) {
		if (isLocal) {
			return Q.reject('Not implemented in local environment');
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
				state: [
					'ACCEPTED',
					'SENT',
					'DELIVERED',
					'OVERDUE',
				],
				type: 'invoice',
				withouttag: 'loyalty',
			},
		}).then(function(result) {
			console.log('got back some stuff on documents', result);
			return _.map(result.Document, function(doc) {
				return {
					documentId: doc.DocumentId,
					customerName: doc.ReceiverCompanyName,
					documentType: doc.DocumentType.type,
					documentNumber: doc.ID,
					issueDate: getDocumentItemInfoValue(doc.ItemInfos, 'document.issuedate'),
					currency: getDocumentItemInfoValue(doc.ItemInfos, 'document.currency'),
					amount: getDocumentItemInfoValue(doc.ItemInfos, 'document.total'),
					isThanked: false
				};
			});
		});
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
			//console.log('got back some stuff on documents', result);
			return _.map(result.Document, function(doc) {
				return {
					documentId: doc.DocumentId,
					customerName: doc.ReceiverCompanyName,
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
	changeDocumentState: function(options) {
		console.log('changing state on', options.documentId);
		return this.sendDocument({
			documentContent: options.documentContent,
			documentId: options.documentId,
			documentProfileId: 'tradeshift.status.1.0',
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
	dispatchDocument: function(options) {
		var that = this;
		return that.sendDocument(options).then(function() {
			var dispatchId = uuid.v4();
			return that._request({
				data: {
					ConnectionId: options.connectionId,
				},
				method: 'PUT',
				path: ['documents', options.documentId, 'dispatches', dispatchId].join('/'),
			});
		});
	},
	getConnections: function(options) {
		console.log('getting connections');
		return this._request({
			method: 'GET',
			path: ['network', 'connections'].join('/'),
			query: {
				limit: 100,
				page: 0,
			},
		}).then(function(result) {
			return _.uniq(result.Connection, 'CompanyName');
		});
	},
	sendConnectionRequest: function(options) {
		console.log('sending connection request', options.connection.ConnectionId);
		return this._request({
			data: options.connection,
			method: 'PUT',
			path: ['network', 'connections', options.connection.ConnectionId].join('/'),
			query: {
				skipRequest: false,
			},
		});
	},
};

module.exports = TradeshiftAPIClient;
