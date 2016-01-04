(function() {
	var resultArea = document.getElementById('js-api-results');

	function getAccountInfo() {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', encodeURI('https://a272fd4f.ngrok.io/ts/info'));
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

	document.getAccountInfo = getAccountInfo;
})(document);
