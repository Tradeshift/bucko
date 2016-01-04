(function() {
	var SECTION_AUTHENTICATION = 'authentication';
	var SECTION_BUCKO = 'bucko';
	var SECTION_TRADESHIFT_API = 'tradeshift-api';

	var sections = {};
	sections[SECTION_AUTHENTICATION] = document.getElementById('js-section-authentication');
	sections[SECTION_BUCKO] = document.getElementById('js-section-bucko');
	sections[SECTION_TRADESHIFT_API] = document.getElementById('js-section-tradeshift-api');

	function showSection(selected) {
		Object.keys(sections).forEach(function(key) {
			sections[key].style.display = key === selected ? 'block' : 'none';
		});
	}

	ts.ui.TopBar.tabs([
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
})();
