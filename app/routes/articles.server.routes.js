'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	articles = require('../../app/controllers/articles.server.controller'),
	multiparty = require('connect-multiparty'),
	multipartyMiddleware = multiparty();

module.exports = function(app) {
	// Article Routes
	app.route('/articles')
		.get(articles.list)
		.post(users.requiresLogin, articles.create);

	app.route('/articles/:articleId')
		.get(articles.read)
		.put(users.requiresLogin, articles.hasAuthorization, articles.update)
		.delete(users.requiresLogin, articles.hasAuthorization, articles.delete);
	
	app.route('/tags?:query')
	   .get(articles.getTags);

	//app.route('/isbn?:query')
	  // .get(articles.queryISBN);

	app.route('/sign_s3')
    	.get(users.requiresLogin, multipartyMiddleware, articles.uploadToS3);

	// Finish by binding the article middleware
	app.param('articleId', articles.articleByID);
	app.param('query', articles.getTags);
};
