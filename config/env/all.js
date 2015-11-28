	'use strict';

module.exports = {
	app: {
		title: 'MEAN.JS',
		description: 'Full-Stack JavaScript with MongoDB, Express, AngularJS, and Node.js',
		keywords: 'mongodb, express, angularjs, node.js, mongoose, passport'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	// The secret should be set to a non-guessable string that
	// is used to compute a session hash
	sessionSecret: 'MEAN',
	// The name of the MongoDB collection to store sessions in
	sessionCollection: 'sessions',
	// The session cookie settings
	sessionCookie: {
		path: '/',
		httpOnly: true,
		// If secure is set to true then it will cause the cookie to be set
		// only when SSL-enabled (HTTPS) is used, and otherwise it won't
		// set a cookie. 'true' is recommended yet it requires the above
		// mentioned pre-requisite.
		secure: false,
		// Only set the maxAge to null if the cookie shouldn't be expired
		// at all. The cookie will expunge when the browser is closed.
		maxAge: null,
		// To set the cookie in a specific domain uncomment the following
		// setting:
		// domain: 'yourdomain.com'
	},
	// The session cookie name
	sessionName: 'connect.sid',
	log: {
		// Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
		format: 'combined',
		// Stream defaults to process.stdout
		// Uncomment to enable logging to a log on the file system
		options: {
			stream: 'access.log'
		}
	},
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.css',
				'public/lib/tx3-tag-cloud/src/tx3-tag-cloud.css'
			],
			js: [
				'public/lib/jquery/dist/jquery.min.js',
	            'public/lib/jquery-bridget/jquery.bridget.js',
				'public/lib/angular/angular.js',
				'public/lib/angular-resource/angular-resource.js',
				'public/lib/angular-animate/angular-animate.js',
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-bootstrap/ui-bootstrap.min.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
				'public/lib/ng-tags-input/ng-tags-input.js',
				'public/lib/underscore/underscore-min.js',
				'public/lib/angular-underscore-module/angular-underscore-module.js',
				'public/lib/tx3-tag-cloud/build/jquery.tx3-tag-cloud.min.js',
				'public/lib/ng-file-upload/FileAPI.min.js', 
	            'public/lib/ng-file-upload/ng-file-upload-shim.min.js',
	            'public/lib/ng-file-upload/ng-file-upload.min.js',
	            'public/lib/bootstrap-filetype/bootstrap-filetype.min.js',
	            'public/lib/eventEmitter/EventEmitter.min.js',
	            'public/lib/eventie/eventie.js',
	            'public/lib/doc-ready/doc-ready.js',
	            'public/lib/get-style-property/get-style-property.js',
	            'public/lib/get-size/get-size.js',
	            'public/lib/fizzy-ui-utils/utils.js',
	            'public/lib/outlayer/item.js',
	            'public/lib/outlayer/outlayer.js',
	            'public/lib/imagesloaded/imagesloaded.js',
	            'public/lib/masonry/masonry.js',
	            'public/lib/masonry-layout/dist/masonry.pkgd.min.js',
	            'public/lib/imagesloaded/imagesloaded.pkgd.js',
	            //'public/lib/masonry-layout/masonry.js',
	            //'public/lib/masonry-layout/dist/masonry.pkgd.min.js',
	            'public/lib/angular-masonry/angular-masonry.js',
	            'public/lib/d3/d3.min.js',
	            'public/lib/simpleWeather/simpleweather.jquery.min.js'
			]
		},
		css: [
			'public/modules/**/css/*.css',
			'public/css/*.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js',
			'public/lib/underscore/underscore-min.js',
	        'public/lib/bootstrap-filetype/bootstrap-filetype.min.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};
