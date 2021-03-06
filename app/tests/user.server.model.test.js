'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User');

/**
 * Globals
 */
var user, user2;

/**
 * Unit tests
 */
describe('User Model Unit Tests:', function() {
	before(function(done) {
		user = new User({
			displayName: 'username',
			username: 'username',
			password: 'password',
			provider: 'local'
		});
		user2 = new User({
			displayName: 'username',
			username: 'username',
			password: 'password',
			provider: 'local'
		});

		done();
	});

	describe('Method Save', function() {
		it('should begin with no users', function(done) {
			User.find({}, function(err, users) {
				users.should.have.length(0);
				done();
			});
		});

		it('should be able to save without problems', function(done) {
			user.save(done, function(){
                done();
            });
		});

		it('should fail to save an existing user again', function(done) {
			user.save();
			return user2.save(function(err) {
				should.exist(err);
				done();
			});
		});

        it('should be able to show an error when try to save without username', function(done) {
            user.username = '';
            return user.save(function(err) {
                should.exist(err);
                done();
                user.username = 'username';
            });
        });

        it('should be able to show an error when try to save without password', function(done) {
            user.password = '';
            return user.save(function(err) {
                should.exist(err);
                done();
                user.password = 'password';
            });
        });

        it('should be able to show an error when password length less than 7 characters', function(done) {
            user.password = '123456';
            return user.save(function(err) {
                should.exist(err);
                done();
                user.password = 'password';
            });
        });
	});

	after(function(done) {
		User.remove().exec();
		done();
	});
});
