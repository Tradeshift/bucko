(function(document) {
	var recent = {
		init: function() {
			console.log('initing');
			console.log('data', document.data);
		},
		thank: function(documentId, businessId) {
			var message = 'thank you so much!';
			console.log('sending thanks to document', documentId);
			document.tradeshift.thank(documentId, businessId, message).then(function(response) {
				console.log('you are welcome');
			});
		},
	};

	document.recent = recent;
})(document);
