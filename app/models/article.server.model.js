'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Article Schema
 */
var ArticleSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	title: {
		type: String,
		default: '',
		trim: true,
		required: 'Title cannot be blank'
	},
	content: {
		type: String,
		default: '',
		trim: true
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	linkUrl: {
		type: String,
		default: ''
	},
	fileUrl: {
		type: String,
		default: ''
	},
	fileTypeCategory: {
		type: String,
		enum: ['image', 'audio']
	},
	isCreatedByUser: {
		type: Boolean,
		default: false
	},
	tags: []
});

mongoose.model('Article', ArticleSchema);
