'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var pictures = require('../../app/controllers/pictures.server.controller');

	// Pictures Routes
	app.route('/pictures')
		.get(pictures.list)
		.post(users.requiresLogin, pictures.create);

	app.route('/pictures/:pictureId')
		.get(pictures.read)
		.put(users.requiresLogin, pictures.hasAuthorization, pictures.update)
		.delete(users.requiresLogin, pictures.hasAuthorization, pictures.delete);

	// Finish by binding the Picture middleware
	app.param('pictureId', pictures.pictureByID);
};
