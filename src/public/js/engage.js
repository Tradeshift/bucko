/*global Chart*/
(function() {
	var data = {
		labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
		datasets: [
			{
				label: 'My First dataset',
				fillColor: 'rgba(220,220,220,0.5)',
				strokeColor: 'rgba(220,220,220,0.8)',
				highlightFill: 'rgba(220,220,220,0.75)',
				highlightStroke: 'rgba(220,220,220,1)',
				data: [65, 59, 80, 81, 56, 55, 40]
			},
			{
				label: 'My Second dataset',
				fillColor: 'rgba(151,187,205,0.5)',
				strokeColor: 'rgba(151,187,205,0.8)',
				highlightFill: 'rgba(151,187,205,0.75)',
				highlightStroke: 'rgba(151,187,205,1)',
				data: [28, 48, 40, 19, 86, 27, 90]
			}
		]
	};

	var engage = {
		init: function() {
			// see docs at http://www.chartjs.org/docs/
			console.log('initing chart');

			// Get the context of the canvas element we want to select
			var context = document.getElementById('chart').getContext('2d');
			var chart = new Chart(context).Bar(data, {
				barShowStroke: false
			});

			document.tradeshift.getCustomers().then(function(customers) {
				console.log('loaded customers', customers);
			});
		},
		thank: function(documentId, documentNumber) {
			var message = 'thank you so much!';
			console.log('sending thanks to document', documentId);
			document.tradeshift.thank(documentId, documentNumber, message).then(function(response) {
				console.log('you are welcome');
			});
		},
	};

	document.engage = engage;
})(document);
