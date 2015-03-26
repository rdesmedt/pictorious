'use strict';

//Pictures service used to communicate Pictures REST endpoints
angular.module('pictures').factory('Pictures', ['$resource',
	function($resource) {
		return $resource('pictures/:pictureId', { pictureId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
