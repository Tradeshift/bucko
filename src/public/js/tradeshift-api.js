/*global Q*/
(function() {
	var resultArea = document.getElementById('js-api-results');

	function _request(method, path, body) {
		var host = 'http://localhost:1337/';
		return Q.Promise(function(resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.open(method, encodeURI([host, path].join('')), true);
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
		var xhr = new XMLHttpRequest();
		xhr.open('GET', encodeURI('https://a272fd4f.ngrok.io/ts/info'), true);
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

	document.tradeshift = {
		getAccountInfo: getAccountInfo,
		getCustomers: getCustomers,
		thank: thank,
	};
})(document);
