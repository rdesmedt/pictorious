'use strict';

// Configuring the Articles module
angular.module('pictures').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Pictures', 'pictures', 'dropdown', '/pictures(/create)?');
		Menus.addSubMenuItem('topbar', 'pictures', 'List Pictures', 'pictures');
		Menus.addSubMenuItem('topbar', 'pictures', 'New Picture', 'pictures/create');
	}
]);