var moment = require('moment');

function applicationResponse(options) {
	var template = JSON.stringify(require('../ubl/ApplicationResponse'))
		.replace('{documentId}', options.documentId)
		.replace('{documentReferenceId}', options.documentReferenceId)
		.replace('{documentReferenceNumber}', options.documentReferenceNumber)
		.replace('{issueDate}', moment().format('YYYY-MM-DD'))
		.replace('{message}', options.message)
		.replace('{responseCode}', options.responseCode);
	return JSON.parse(template);
}

module.exports = {
	applicationResponse: applicationResponse,
};
