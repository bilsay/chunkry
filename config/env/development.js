'use strict';

module.exports = {
	db: {
	//	uri: 'mongodb://localhost/mean-dev',
		uri: 'mongodb://bilsay:kafkaf35@ds033380.mongolab.com:33380/heroku_app34691828',
		options: {
			user: '',
			pass: ''
		}
	},
	log: {
		// Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
		format: 'dev',
		// Stream defaults to process.stdout
		// Uncomment to enable logging to a log on the file system
		options: {
			//stream: 'access.log'
		}
	},
	app: {
		title: 'chunkry - chunks on your mind'
	},
	facebook: {
		clientID: process.env.FACEBOOK_ID || '831763046898407',
		clientSecret: process.env.FACEBOOK_SECRET || '3c36ce06c2dcc16203c61610d0428cbd',
		callbackURL: '/auth/facebook/callback'
	},
	twitter: {
		clientID: process.env.TWITTER_KEY || 'O4UCTs74pRY86qqQpfcGunH3B',
		clientSecret: process.env.TWITTER_SECRET || 'pS2e9dNpeC15BNJYHWElWdQ5gKelmLzUF9qX0mf7rpwrH4BGrT',
		callbackURL: '/auth/twitter/callback'
	},
	google: {
		clientID: process.env.GOOGLE_ID || '638168693320-tba2r96v8v3jq3t3rfe69m0rs930115j.apps.googleusercontent.com',
		clientSecret: process.env.GOOGLE_SECRET || 'grvl_nbOLexywruCEuAc-UMB',
		callbackURL: '/auth/google/callback'
	},
	linkedin: {
		clientID: process.env.LINKEDIN_ID || 'APP_ID',
		clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
		callbackURL: '/auth/linkedin/callback'
	},
	github: {
		clientID: process.env.GITHUB_ID || 'APP_ID',
		clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
		callbackURL: '/auth/github/callback'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'MAILER_FROM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
				pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
			}
		}
	}
};
