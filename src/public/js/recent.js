(function(document) {
	var recent = {
		init: function() {
			console.log('initing');
			console.log('data', document.data);
			// document.tradeshift.getCustomers().then(function(response) {
			// 	console.log('here is the data', response);
			// });
		},
		thank: function() {
			var companyName = document.getElementById('js-companyName').innerHTML;
			var documentId = document.getElementById('js-documentId').dataset.documentId;
			var documentNumber = document.getElementById('js-documentNumber').dataset.documentNumber;
			var message = document.getElementById('js-message').value;
			console.log('sending thanks to document', documentId);
			document.tradeshift.thank(documentId, documentNumber, message).then(function(response) {
			document.getElementById('myaside').setAttribute("ts.open", false);
			var wrapper = document.querySelectorAll(['.document-wrapper[data-document-id="', documentId, '"]'].join(''))[0];
			wrapper.classList.add('is-thanked');
			});
			
		},
		open: function(documentId, documentNumber, companyName) {
			document.getElementById('myaside').setAttribute("ts.open", true);
			document.getElementById('js-companyName').innerHTML=companyName;
			document.getElementById('js-documentId').dataset.documentId = documentId;
			document.getElementById('js-documentNumber').dataset.documentNumber = documentNumber;
		},
	};

	document.recent = recent;
})(document);
