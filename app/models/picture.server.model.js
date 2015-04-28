'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Picture Schema
 */
var PictureSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Picture name',
		trim: true
	},
    path: {
        type: String,
        default: '',
        required: 'Path not set',
        trim: true
    },
    tags: [{type: Schema.ObjectId, ref: 'Tag'}
    ],
    upvote: [{
        user: {type: Schema.ObjectId, ref: 'User'},
        date: {type: Date, default: Date.now}
    }],
    downvote: [{
        user: {type: Schema.ObjectId, ref: 'User'},
        date: {type: Date, default: Date.now}
    }],
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
    points: {
        type: Number,
        default: 0
    }
});

mongoose.model('Picture', PictureSchema);
