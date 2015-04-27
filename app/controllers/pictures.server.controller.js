'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Picture = mongoose.model('Picture'),
    Tag = mongoose.model('Tag'),
	_ = require('lodash'),
    async = require('async');

/**
 * Create a Picture
 */
exports.create = function(req, res) {

    if(!req.body.tags){
        return res.status(400).send({
            message: 'Include at least one tag'
        });
    }

    var picture = new Picture();

    var tags = JSON.parse(req.body.tags);

    //Saving new tags tot Tag db
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

        picture.name = req.body.picTitle;
        picture.path = req.files.file.path;
        picture.user = req.user;

        picture.save(function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(picture);
            }
        });
    });



};

/**
 * Show the current Picture
 */
exports.read = function(req, res) {
	res.jsonp(req.picture);
};

/**
 * Update a Picture
 */
exports.update = function(req, res) {
	var picture = req.picture ;

	picture = _.extend(picture , req.body);

	picture.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(picture);
		}
	});
};

/**
 * Delete an Picture
 */
exports.delete = function(req, res) {
	var picture = req.picture ;

	picture.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(picture);
		}
	});
};

/**
 * List of Pictures
 */
exports.list = function(req, res) { 
	Picture
        .find()
        .sort('-created')
        .populate('user tags', 'displayName tag')
        .exec(function(err, pictures) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(pictures);
		}
	});
};

/**
 * Picture middleware
 */
exports.pictureByID = function(req, res, next, id) {
	Picture
        .findById(id)
        .populate('user tags', 'displayName tag')
        .exec(function(err, picture) {
            if (err) return next(err);
            if (! picture) return next(new Error('Failed to load Picture ' + id));
            req.picture = picture ;
            next();
	});
};

/**
 * Picture authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.picture.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

/**
 * List of Tags
 */
exports.tagList = function(req, res) {
    var query = '';
    var tagList = [];

    _.forEach(req.query, function(item, n){
        query = query + item;
    });

    Tag
        .find({}, {'_id': 0})
        .where('tag').regex(new RegExp(query, 'i'))
        .sort('tag')
        .select('tag')
        .exec(function(err, tags) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {

                _.forEach(tags, function(item, n){
                    tagList.push(item.tag);
                });
                console.log(tagList);
                res.jsonp(tagList);
            }
        });
};

/**
 * Picture list by tags
 */
exports.byTag = function(req,res,tag){
    var query = '';
    var tagID = '';
        _.forEach(req.query, function(item, n){
        query = query + item;
    });

    async.parallel([function(callback){
        Tag
            .find()
            .where('tag').equals(query)
            .select('_id')
            .exec(function(err, tag){
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    tagID = tag;
                }
                callback();
            });
    }],function(err){
        if (err){
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }else{
            Picture
                .find()
                .sort('-created')
                .where('tags').in(tagID)
                .populate('user tags', 'displayName tag')
                .exec(function(err, pictures) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp(pictures);
                    }
                });
        }
    });
};

/**
 * upvote a picture
 */
exports.upvote = function(req, res){
    var picture = req.picture ;
    var upvote = { user: req.user._id, date: Date.now()};
    var voteExists = false;


    async.parallel([function(callback){
        Picture
            .find(picture)
            .exec(function(err, pictureRes){
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else{
                    _.forEach(picture.upvote, function(item, n){
                        if(JSON.stringify(item.user) === JSON.stringify(upvote.user)){
                            voteExists = true;
                        }
                    });
                    _.forEach(picture.downvote, function(item, n){
                        if(JSON.stringify(item.user) === JSON.stringify(upvote.user)){
                            _.remove(picture.downvote, { user: item.user });
                        }
                    });
                }
                picture.upvote.push(upvote);
                callback();
            });
    }],function(err){
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        if (voteExists) {
            return res.status(400).send({
                message: 'Only one upvote per user'
            });
        } else {
            Picture.findByIdAndUpdate(picture._id, picture, function(err, pic){
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
                if (res.statusCode === 200) {
                    Picture
                        .find()
                        .sort('-created')
                        .populate('user tags', 'displayName tag')
                        .exec(function(err, pictures) {
                            if (err) {
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            } else {
                                res.jsonp(pictures);
                            }
                        });
                }
            });
        }
    });


};

/**
 * downvote a picture
 */
exports.downvote = function(req, res){
    var picture = req.picture ;
    var downvote = { user: req.user._id, date: Date.now()};
    var voteExists = false;

    async.parallel([function(callback){
        Picture
            .find(picture)
            .exec(function(err, pictureRes){
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else{
                    _.forEach(picture.downvote, function(item, n){
                        if(JSON.stringify(item.user) === JSON.stringify(downvote.user)){
                            voteExists = true;
                        }
                    });
                    //console.log(picture.upvote[0]);
                    _.forEach(picture.upvote, function(item, n){
                        if(JSON.stringify(item.user) === JSON.stringify(downvote.user)){
                            _.remove(picture.upvote, { user: item.user });
                        }
                    });
                }
                picture.downvote.push(downvote);
                callback();
            });
    }],function(err){
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } if (voteExists) {
            return res.status(400).send({
                message: 'Only one downvote per user'
            });
        } else {

            Picture.findByIdAndUpdate(picture._id, picture, function(err, pic){
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
                if (res.statusCode === 200) {
                    Picture
                        .find()
                        .sort('-created')
                        .populate('user tags', 'displayName tag')
                        .exec(function(err, pictures) {
                            if (err) {
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            } else {
                                res.jsonp(pictures);
                            }
                        });
                }
            });
        }
    });


};
