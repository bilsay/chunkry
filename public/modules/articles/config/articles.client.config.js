'use strict';

// Configuring the Articles module
angular.module('articles').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Chunks', 'articles', 'dropdown', '/articles(/create)?');
		Menus.addSubMenuItem('topbar', 'articles', 'List Chunks', 'articles');
		Menus.addSubMenuItem('topbar', 'articles', 'New Chunk', 'articles/create');
	}
]);