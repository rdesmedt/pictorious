'use strict';

//Setting up route
angular.module('pictures').config(['$stateProvider',
	function($stateProvider) {
		// Pictures state routing
		$stateProvider.
		state('listPictures', {
			url: '/pictures',
			templateUrl: 'modules/pictures/views/list-pictures.client.view.html'
		}).
		state('createPicture', {
			url: '/pictures/create',
			templateUrl: 'modules/pictures/views/create-picture.client.view.html'
		}).
		state('viewPicture', {
			url: '/pictures/:pictureId',
			templateUrl: 'modules/pictures/views/view-picture.client.view.html'
		}).
		state('editPicture', {
			url: '/pictures/:pictureId/edit',
			templateUrl: 'modules/pictures/views/edit-picture.client.view.html'
		});
	}
]);
