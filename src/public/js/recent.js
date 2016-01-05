/*global tradeshift*/
(function() {
	var recent = {
		init: function() {
			console.log('initing');
			console.log('data', document.data);
		},
		thank: function(documentId, documentNumber) {
			var message = 'thank you so much!';
			console.log('sending thanks to document', documentId);
			document.tradeshift.thank(documentId, documentNumber, message).then(function(response) {
				console.log('you are welcome');
			});
		},
	};

	document.recent = recent;
})(document);
