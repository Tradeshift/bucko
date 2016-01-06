(function(document) {
	var SECTION_AUTHENTICATION = 'authentication';
	var SECTION_BUCKO = 'bucko';
	var SECTION_ENGAGE = 'engage';
	var SECTION_RECENT = 'recent';
	var SECTION_TRADESHIFT_API = 'tradeshift-api';

	var sectionKeys = [
		SECTION_AUTHENTICATION,
		SECTION_BUCKO,
		SECTION_ENGAGE,
		SECTION_RECENT,
		SECTION_TRADESHIFT_API,
	];
	var sections = {};
	sectionKeys.forEach(function(key) {
		sections[key] = document.getElementById(['js-section-', key].join(''));
	});

	function showSection(selected) {
		Object.keys(sections).forEach(function(key) {
			sections[key].style.display = key === selected ? 'block' : 'none';
		});
	}

	ts.ui.TopBar.tabs([
		{
			label: 'Recent',
			onselect: function() {
				console.log('initing from recent tab');
				document.recent.init();
				showSection(SECTION_RECENT);
			}
		},
		{
			label: 'Engage',
			onselect: function() {
				console.log('initing from engage tab');
				document.engage.init();
				showSection(SECTION_ENGAGE);
			}
		},
		{
			label: 'Bucko',
			onselect: function() {
				showSection(SECTION_BUCKO);
			}
		},
		{
			label: 'Authentication',
			onselect : function() {
				showSection(SECTION_AUTHENTICATION);
			}
		},
		{
			label: 'Tradeshift API',
			onselect: function() {
				showSection(SECTION_TRADESHIFT_API);
			}
		}
	]);
})(document);
