'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
    async = require('async'),
	User = mongoose.model('User'),
	Picture = mongoose.model('Picture'),
    Tag = mongoose.model('Tag'),
    Comment = mongoose.model('Comment'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, picture, tags, boundary;

/**
 * Picture routes tests
 */


describe('Picture CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			displayName: 'Full Name',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

        boundary = Math.random();

		// Save a user to the test db and create new Picture
		user.save(function() {
			picture = {
				name: 'Picture Title',
                path: __dirname + '/img/noel.jpg'
			};



			done();
		});
	});

	it('should be able to save Picture instance if logged in', function(done) {


		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Picture
				agent.post('/pictures')
                    //.set('Connection', 'keep alive')
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .field('picTitle', 'Picture Title')
                    .field('tags', '[{"name":"tag1"},{"name":"tag2"},{"name":"tag3"}]')
                    .attach('file', __dirname + '/img/noel.jpg')
					.end(function(pictureSaveErr, pictureSaveRes) {
						// Handle Picture save error
						if (pictureSaveErr) done(pictureSaveErr);

						// Get a list of Pictures
						agent.get('/pictures')
							.end(function(picturesGetErr, picturesGetRes) {
								// Handle Picture save error
								if (picturesGetErr) done(picturesGetErr);

								// Get Pictures list
								var pictures = picturesGetRes.body;

								// Set assertions
								(pictures[0].user._id).should.equal(userId);
								(pictures[0].name).should.match('Picture Title');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Picture instance if not logged in', function(done) {
		agent.post('/pictures')
            //.set('Connection', 'keep alive')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .field('picTitle', 'Picture Title')
            .field('tags', '[{"name":"tag1"},{"name":"tag2"},{"name":"tag3"}]')
            .attach('file', __dirname + '/img/noel.jpg')
            .expect(401)
			.end(function(pictureSaveErr, pictureSaveRes) {
				// Call the assertion callback
				done(pictureSaveErr);
			});
	});

	it('should not be able to save Picture instance if no name is provided', function(done) {
		// Invalidate name field
		picture.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Picture
				agent.post('/pictures')
                    //.set('Connection', 'keep alive')
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .field('picTitle', picture.name)
                    .field('tags', '[{"name":"tag1"},{"name":"tag2"},{"name":"tag3"}]')
                    .attach('file', __dirname + '/img/noel.jpg')
					.expect(400)
					.end(function(pictureSaveErr, pictureSaveRes) {
						// Set message assertion
						(pictureSaveRes.body.message).should.match('Please fill Picture name');
						
						// Handle Picture save error
						done(pictureSaveErr);
					});
			});
	});

    it('should not be able to save Picture instance if no tag is provided', function(done) {
        // Invalidate name field
        picture.name = 'Picture Title';

        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function(signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                // Get the userId
                var userId = user.id;

                // Save a new Picture
                agent.post('/pictures')
                    //.set('Connection', 'keep alive')
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .field('picTitle', picture.name)
                    .field('tags', '')
                    .attach('file', __dirname + '/img/noel.jpg')
                    .expect(400)
                    .end(function(pictureSaveErr, pictureSaveRes) {
                        // Set message assertion
                        (pictureSaveRes.body.message).should.match('Include at least one tag');

                        // Handle Picture save error
                        done(pictureSaveErr);
                    });
            });
    });

	it('should be able to update Picture instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Picture
				agent.post('/pictures')
                    //.set('Connection', 'keep alive')
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .field('picTitle', 'Picture Title')
                    .field('tags', '[{"name":"tag1"},{"name":"tag2"},{"name":"tag3"}]')
                    .attach('file', __dirname + '/img/noel.jpg')
					.expect(200)
					.end(function(pictureSaveErr, pictureSaveRes) {
						// Handle Picture save error
						if (pictureSaveErr) done(pictureSaveErr);

						// Update Picture name
						picture.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Picture
						agent.put('/pictures/' + pictureSaveRes.body._id)
							.send(picture)
							.expect(200)
							.end(function(pictureUpdateErr, pictureUpdateRes) {
								// Handle Picture update error
								if (pictureUpdateErr) done(pictureUpdateErr);

								// Set assertions
								(pictureUpdateRes.body._id).should.equal(pictureSaveRes.body._id);
								(pictureUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Pictures if not signed in', function(done) {
		// Create new Picture model instance
		var pictureObj = new Picture(picture);

		// Save the Picture
		pictureObj.save(function() {
			// Request Pictures
			request(app).get('/pictures')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Picture if not signed in', function(done) {
		// Create new Picture model instance
		var pictureObj = new Picture(picture);

		// Save the Picture
		pictureObj.save(function() {
			request(app).get('/pictures/' + pictureObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', picture.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Picture instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Picture
				agent.post('/pictures')
                    //.set('Connection', 'keep alive')
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .field('picTitle', 'Picture Title')
                    .field('tags', '[{"name":"tag1"},{"name":"tag2"},{"name":"tag3"}]')
                    .attach('file', __dirname + '/img/noel.jpg')
					.expect(200)
					.end(function(pictureSaveErr, pictureSaveRes) {
						// Handle Picture save error
						if (pictureSaveErr) done(pictureSaveErr);

						// Delete existing Picture
						agent.delete('/pictures/' + pictureSaveRes.body._id)
							.send(picture)
							.expect(200)
							.end(function(pictureDeleteErr, pictureDeleteRes) {
								// Handle Picture error error
								if (pictureDeleteErr) done(pictureDeleteErr);

								// Set assertions
								(pictureDeleteRes.body._id).should.equal(pictureSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Picture instance if not signed in', function(done) {
		// Set Picture user 
		picture.user = user;

		// Create new Picture model instance
		var pictureObj = new Picture(picture);

		// Save the Picture
		pictureObj.save(function() {
			// Try deleting Picture
			request(app).delete('/pictures/' + pictureObj._id)
			.expect(401)
			.end(function(pictureDeleteErr, pictureDeleteRes) {
				// Set message assertion
				(pictureDeleteRes.body.message).should.match('User is not logged in');

				// Handle Picture error error
				done(pictureDeleteErr);
			});

		});
	});

    it('should be able to update Picture with upvote if signed in', function(done) {
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function(signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                // Get the userId
                var userId = user.id;

                // Save a new Picture
                agent.post('/pictures')
                    //.set('Connection', 'keep alive')
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .field('picTitle', 'Picture Title')
                    .field('tags', '[{"name":"tag1"},{"name":"tag2"},{"name":"tag3"}]')
                    .attach('file', __dirname + '/img/noel.jpg')
                    .expect(200)
                    .end(function(pictureSaveErr, pictureSaveRes) {
                        // Handle Picture save error
                        if (pictureSaveErr) done(pictureSaveErr);


                        // cast upvote
                        agent.put('/pictures/' + pictureSaveRes.body._id + '/upvote')
                            .send(picture)
                            .expect(200)
                            .end(function(pictureUpdateErr, pictureUpdateRes) {
                                // Handle Picture update error
                                if (pictureUpdateErr) done(pictureUpdateErr);

                                // Set assertions
                                (pictureUpdateRes.body[0].upvote[0].user).should.equal(user.id);

                                // Call the assertion callback
                                done();
                            });
                    });
            });
    });

    it('should be able to update Picture with downvote if signed in', function(done) {
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function(signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                // Get the userId
                var userId = user.id;

                // Save a new Picture
                agent.post('/pictures')
                    //.set('Connection', 'keep alive')
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .field('picTitle', 'Picture Title')
                    .field('tags', '[{"name":"tag1"},{"name":"tag2"},{"name":"tag3"}]')
                    .attach('file', __dirname + '/img/noel.jpg')
                    .expect(200)
                    .end(function(pictureSaveErr, pictureSaveRes) {
                        // Handle Picture save error
                        if (pictureSaveErr) done(pictureSaveErr);


                        // cast downvote
                        agent.put('/pictures/' + pictureSaveRes.body._id + '/downvote')
                            .send(picture)
                            .expect(200)
                            .end(function(pictureUpdateErr, pictureUpdateRes) {
                                // Handle Picture update error
                                if (pictureUpdateErr) done(pictureUpdateErr);

                                // Set assertions
                                (pictureUpdateRes.body[0].downvote[0].user).should.equal(user.id);

                                // Call the assertion callback
                                done();
                            });
                    });
            });
    });

    it('should not be able for a user to cast multiple upvotes', function(done){
        var pictureID;
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function(signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                // Get the userId
                var userId = user.id;

                // Save a new Picture
                agent.post('/pictures')
                    //.set('Connection', 'keep alive')
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .field('picTitle', 'Picture Title')
                    .field('tags', '[{"name":"tag1"},{"name":"tag2"},{"name":"tag3"}]')
                    .attach('file', __dirname + '/img/noel.jpg')
                    .expect(200)
                    .end(function(pictureSaveErr, pictureSaveRes) {
                        // Handle Picture save error
                        if (pictureSaveErr) done(pictureSaveErr);

                        pictureID = pictureSaveRes.body._id;

                        async.parallel([function(callback){
                            // cast first upvote
                            agent.put('/pictures/' + pictureID + '/upvote')
                                .send(picture)
                                .expect(200)
                                .end(function(pictureUpdateErr, pictureUpdateRes) {
                                    // Handle Picture update error
                                    if (pictureUpdateErr) done(pictureUpdateErr);

                                    // Set assertions
                                    (pictureUpdateRes.body[0].upvote[0].user).should.equal(user.id);
                                    callback();
                                });
                        }], function(err){
                            // cast second upvote that should fail
                            agent.put('/pictures/' + pictureID + '/upvote')
                                .send(picture)
                                .expect(400)
                                .end(function(pictureUpdateErr, pictureUpdateRes) {
                                    // Set message assertions
                                    (pictureUpdateRes.body.message).should.match('Only one upvote per user');

                                    // handle vote error
                                    done(pictureUpdateErr);
                                });
                        });

                    });

            });
    });

    it('should not be able for a user to cast multiple downvotes', function(done){
        var pictureID;
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function(signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                // Get the userId
                var userId = user.id;

                // Save a new Picture
                agent.post('/pictures')
                    //.set('Connection', 'keep alive')
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .field('picTitle', 'Picture Title')
                    .field('tags', '[{"name":"tag1"},{"name":"tag2"},{"name":"tag3"}]')
                    .attach('file', __dirname + '/img/noel.jpg')
                    .expect(200)
                    .end(function(pictureSaveErr, pictureSaveRes) {
                        // Handle Picture save error
                        if (pictureSaveErr) done(pictureSaveErr);

                        pictureID = pictureSaveRes.body._id;

                        async.parallel([function(callback){
                            // cast first downvote
                            agent.put('/pictures/' + pictureID + '/downvote')
                                .send(picture)
                                .expect(200)
                                .end(function(pictureUpdateErr, pictureUpdateRes) {
                                    // Handle Picture update error
                                    if (pictureUpdateErr) done(pictureUpdateErr);

                                    // Set assertions
                                    (pictureUpdateRes.body[0].downvote[0].user).should.equal(user.id);
                                    callback();
                                });
                        }], function(err){
                            // cast second downvote that should fail
                            agent.put('/pictures/' + pictureID + '/downvote')
                                .send(picture)
                                .expect(400)
                                .end(function(pictureUpdateErr, pictureUpdateRes) {
                                    // Set message assertions
                                    (pictureUpdateRes.body.message).should.match('Only one downvote per user');

                                    // handle vote error
                                    done(pictureUpdateErr);
                                });
                        });

                    });

            });
    });

    it('should be able for a user to change upvote te downvote', function(done){
        var pictureID;
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function(signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                // Get the userId
                var userId = user.id;

                // Save a new Picture
                agent.post('/pictures')
                    //.set('Connection', 'keep alive')
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .field('picTitle', 'Picture Title')
                    .field('tags', '[{"name":"tag1"},{"name":"tag2"},{"name":"tag3"}]')
                    .attach('file', __dirname + '/img/noel.jpg')
                    .expect(200)
                    .end(function(pictureSaveErr, pictureSaveRes) {
                        // Handle Picture save error
                        if (pictureSaveErr) done(pictureSaveErr);

                        pictureID = pictureSaveRes.body._id;

                        async.parallel([function(callback){
                            // cast upvote
                            agent.put('/pictures/' + pictureID + '/upvote')
                                .send(picture)
                                .expect(200)
                                .end(function(pictureUpdateErr, pictureUpdateRes) {
                                    // Handle Picture update error
                                    if (pictureUpdateErr) done(pictureUpdateErr);

                                    // Set assertions
                                    (pictureUpdateRes.body[0].upvote[0].user).should.equal(user.id);
                                    callback();
                                });
                        }], function(err){
                            // change vote to downvote
                            agent.put('/pictures/' + pictureID + '/downvote')
                                .send(picture)
                                .expect(200)
                                .end(function(pictureUpdateErr, pictureUpdateRes) {
                                    // Set message assertions
                                  (pictureUpdateRes.body[0].upvote.length).should.equal(0);
                                  (pictureUpdateRes.body[0].downvote.length).should.equal(1);

                                    // handle vote error
                                    done(pictureUpdateErr);
                                });
                        });

                    });

            });
    });

    it('should be able for a user to change downvote te upvote', function(done){
        var pictureID;
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function(signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                // Get the userId
                var userId = user.id;

                // Save a new Picture
                agent.post('/pictures')
                    //.set('Connection', 'keep alive')
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .field('picTitle', 'Picture Title')
                    .field('tags', '[{"name":"tag1"},{"name":"tag2"},{"name":"tag3"}]')
                    .attach('file', __dirname + '/img/noel.jpg')
                    .expect(200)
                    .end(function(pictureSaveErr, pictureSaveRes) {
                        // Handle Picture save error
                        if (pictureSaveErr) done(pictureSaveErr);

                        pictureID = pictureSaveRes.body._id;

                        async.parallel([function(callback){
                            // cast downvote
                            agent.put('/pictures/' + pictureID + '/downvote')
                                .send(picture)
                                .expect(200)
                                .end(function(pictureUpdateErr, pictureUpdateRes) {
                                    // Handle Picture update error
                                    if (pictureUpdateErr) done(pictureUpdateErr);

                                    // Set assertions
                                    (pictureUpdateRes.body[0].downvote[0].user).should.equal(user.id);
                                    callback();
                                });
                        }], function(err){
                            // change vote to upvote
                            agent.put('/pictures/' + pictureID + '/upvote')
                                .send(picture)
                                .expect(200)
                                .end(function(pictureUpdateErr, pictureUpdateRes) {
                                    // Set message assertions
                                  (pictureUpdateRes.body[0].upvote.length).should.equal(1);
                                  (pictureUpdateRes.body[0].downvote.length).should.equal(0);

                                    // handle vote error
                                    done(pictureUpdateErr);
                                });
                        });

                    });

            });
    });

    it('should be able for a user to post a comment', function(done) {
        var pictureID;

        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                // Get the userId
                var userId = user.id;

                // Save a new Picture
                agent.post('/pictures')
                    //.set('Connection', 'keep alive')
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .field('picTitle', 'Picture Title')
                    .field('tags', '[{"name":"tag1"},{"name":"tag2"},{"name":"tag3"}]')
                    .attach('file', __dirname + '/img/noel.jpg')
                    .expect(200)
                    .end(function (pictureSaveErr, pictureSaveRes) {
                        // Handle Picture save error
                        if (pictureSaveErr) done(pictureSaveErr);

                        pictureID = pictureSaveRes.body._id;

                        agent.put('/pictures/' + pictureID + '/comment')
                            .send(picture)
                            .field('comment', 'This is a comment!')
                            .expect(200)
                            .end(function (pictureUpdateErr, pictureUpdateRes) {
                                // Handle Picture save error
                                if (pictureUpdateErr) done(pictureUpdateErr);

                                Comment.findById(pictureUpdateRes.body.comments[0]._id, function(err, comment){
                                    if(err){
                                        done(err);
                                    }

                                    (comment.comment).should.equal('This is a comment!');

                                });

                                done();
                            });

                    });
            });
    });

	afterEach(function(done) {
		User.remove().exec();
		Picture.remove().exec();
        Tag.remove().exec();
		done();
	});

});


