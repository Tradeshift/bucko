var moment = require('moment');

function applicationResponse(options) {
	var template = JSON.stringify(require('../ubl/ApplicationResponse'))
		.replace(/{documentId}/g, options.documentId)
		.replace(/{documentReferenceId}/g, options.documentReferenceId)
		.replace(/{documentReferenceNumber}/g, options.documentReferenceNumber)
		.replace(/{issueDate}/g, moment().format('YYYY-MM-DD'))
		.replace(/{message}/g, options.message)
		.replace(/{responseCode}/g, options.responseCode);
	return JSON.parse(template);
}

function invoice(options) {
	var template = JSON.stringify(require('../ubl/Invoice'))
		.replace(/{businessId}/g, options.businessId)
		.replace(/{issueDate}/g, options.issueDate)
		.replace(/{currencyCode}/g, options.currencyCode)
		.replace(/{senderCompanyId}/g, options.senderCompanyId)
		.replace(/{senderCompanyName}/g, options.senderCompanyName)
		.replace(/{senderUserId}/g, options.senderUserId)
		.replace(/{receiverCompanyName}/g, options.receiverCompanyName)
		.replace(/{receiverEmail}/g, options.receiverEmail)
		.replace(/{payableAmount}/g, options.payableAmount);
	return JSON.parse(template);
}

module.exports = {
	applicationResponse: applicationResponse,
	invoice: invoice,
};
