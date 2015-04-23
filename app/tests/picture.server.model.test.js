'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
    async = require('async'),
	User = mongoose.model('User'),
	Picture = mongoose.model('Picture'),
    Tag = mongoose.model('Tag');

/**
 * Globals
 */
var user, picture, tag1, tag2, tag3;

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
            var tags = [{ name: 'tag1'},{ name: 'tag2'},{ name: 'tag3'}];

            async.filter(tags,function(item, callback){
                    var tg = new Tag();
                    tg.tag = item.name;
                    Tag.findOne({
                            tag: tg.tag
                        },
                        function(err, tag){
                            if (!err){
                                if (!tag){
                                    tg.save(function (err) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            picture.tags.push(tg._id);
                                            return callback(false);
                                        }
                                    });
                                } else {
                                    picture.tags.push(tag._id);
                                    return callback(true);
                                }
                            }

                        });
                },
                function(results){

                    return picture.save(function(err) {
                        should.not.exist(err);
                        done();
                    });
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
        /*
        it('should be able to show an error when try to save without tag', function(done) {
            picture.tags = [];
            picture.path = '/year/month/day/hash.jpg';

            return picture.save(function(err) {
                should.exist(err);
                done();
            });
        });
        */
        it('should be able to update a picture with an upvote', function(done){
            picture.upvote.user = user;
            picture.upvote.date = Date.now();

            return picture.update(function(err){
                should.not.exist(err);
                done();
            });
        });
        it('should be able to update a picture with an downvote', function(done){
            picture.downvote.user = user;
            picture.downvote.date = Date.now();

            return picture.update(function(err){
                should.not.exist(err);
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
