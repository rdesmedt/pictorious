/**
 * Created by Roeland on 1/04/15.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Tag schema
 */

var TagSchema = new Schema({
    tag: {
        type: String
    }
});

mongoose.model('Tag', TagSchema);
