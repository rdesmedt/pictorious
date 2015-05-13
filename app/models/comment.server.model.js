/**
 * Created by Roeland on 6/05/15.
 */

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Comment Schema
 */


var CommentSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now
    },
    comment: {
        type: String,
        required: 'No Comment given!'
    }
});

mongoose.model('Comment', CommentSchema);
