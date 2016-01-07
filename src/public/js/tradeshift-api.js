/*global Q*/
(function(document) {
	var resultArea = document.getElementById('js-api-results');
	var host = document.globals.host;

	function _request(method, path, body) {
		return Q.Promise(function(resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.open(method, encodeURI([host, path].join('/')), true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.setRequestHeader('Accept', 'application/json');
			xhr.onload = function() {
				if (xhr.status === 200) {
					resolve(xhr.responseText ? JSON.parse(xhr.responseText) : null);
				} else {
					reject(xhr.status);
				}
			};
			xhr.send(JSON.stringify(body));
		});
	}


	function getAccountInfo() {
		resultArea.innerHTML = 'Loading...';
		var xhr = new XMLHttpRequest();
		xhr.open('GET', encodeURI([host, 'ts/info'].join('/')), true);
		xhr.onload = function() {
			if (xhr.status === 200) {
				console.log('Response is', xhr.responseText);
				var data = JSON.parse(xhr.responseText);
				resultArea.innerHTML = JSON.stringify(data, undefined, 2);
			} else {
				console.log('Oh snap! ' + xhr.status);
			}
		};
		xhr.send();
	}

	function thank(documentId, businessId, message) {
		var path = ['loyalty', 'document', documentId, 'thank'].join('/');
		var body = {
			businessId: businessId,
			message: message,
		};
		return _request('POST', path, body);
	}

	function getCustomers() {
		var path = ['loyalty', 'customers'].join('/');
		return _request('GET', path);
	}

	function generateConnections() {
		resultArea.innerHTML = 'Loading...';
		var path = ['generate', 'connections'].join('/');
		_request('POST', path).then(function(result) {
			resultArea.innerHTML = JSON.stringify(result, undefined, 2);
		});
	}

	function generateDocuments() {
		resultArea.innerHTML = 'Loading...';
		var path = ['generate', 'documents'].join('/');
		_request('POST', path).then(function(result) {
			resultArea.innerHTML = JSON.stringify(result, undefined, 2);
		});
	}

	function generatePayments() {
		resultArea.innerHTML = 'Loading...';
		var path = ['generate', 'documents', 'payments'].join('/');
		_request('POST', path).then(function(result) {
			resultArea.innerHTML = JSON.stringify(result, undefined, 2);
		});
	}

	document.tradeshift = {
		generateConnections: generateConnections,
		generateDocuments: generateDocuments,
		generatePayments: generatePayments,
		getAccountInfo: getAccountInfo,
		getCustomers: getCustomers,
		thank: thank,
	};
})(document);
