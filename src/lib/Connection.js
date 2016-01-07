var uuid = require('node-uuid');

function buildEmail(companyName) {
	return [companyName.replace(/\s+/g, '').toLowerCase(), '@mailinator.com'].join('');
}

function buildInvitationReturnUrl(connectionId, tradeshiftHost) {
	return [
		'https://',
		tradeshiftHost.replace('api-', ''),
		'/register/invited?token=',
		connectionId,
	].join('');
}

function createRequest(options) {
	var connectionId = uuid.v4();
	console.log('Creating connection request for', options);
	var connection = {
		ConnectionId: connectionId,
		ConnectionType: 'ExternalConnection',
		CompanyName: options.companyName,
		Country: 'US',
		Email: buildEmail(options.companyName),
		DispatchChannelID: 'EMAIL',
		Invitation: {
			Text: '',
			ReturnUrl: buildInvitationReturnUrl(connectionId, options.tradeshiftHost),
		},
	};
	console.log('Created connection request', connection);
	return connection;
}

module.exports = {
	createRequest: createRequest,
};
