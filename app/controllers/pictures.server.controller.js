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
                                    console.log('Save: ' + tg);
                                    picture.tags.push(tg._id);
                                    return callback(false);
                                }
                            });
                        } else {
                            console.log('Tag found: ' + tag);
                            picture.tags.push(tag._id);
                            return callback(true);
                        }
                    }

                });
    },
    function(results){
        console.log('PICTURE TAG IDS: ' + picture.tags);

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
            console.log('LIST OF PICTURES: ' + pictures);
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
            console.log('PICTURE DETAIL: ' + picture);
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

    console.log('TAGLIST SEARCH HIT: ' + query);
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
