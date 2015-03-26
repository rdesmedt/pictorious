'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Picture = mongoose.model('Picture');

/**
 * Globals
 */
var user, picture;

/**
 * Unit tests
 */
describe('Picture Model Unit Tests:', function() {
	beforeEach(function(done) {
		user = new User({
			displayName: 'username',
            username: 'username',
			password: 'password'
		});

		user.save(function() { 
			picture = new Picture({
				name: 'Picture Name',
                path: '/year/month/day/hash.jpg',
				user: user
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return picture.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without name', function(done) { 
			picture.name = '';

			return picture.save(function(err) {
				should.exist(err);
				done();
			});
		});

        it('should be able to show an error when try to save without path', function(done) {
            picture.name = 'Picture name';
            picture.path = '';

            return picture.save(function(err) {
                should.exist(err);
                done();
            });
        });
	});

	afterEach(function(done) { 
		Picture.remove().exec();
		User.remove().exec();

		done();
	});
});
