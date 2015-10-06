'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Article = mongoose.model('Article'),
	multiparty = require('multiparty'),
	uuid = require('uuid'),	
	fs = require('fs'),
	_ = require('lodash'),
    aws = require('aws-sdk');

	var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
	var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
	var S3_BUCKET = process.env.S3_BUCKET;
	var S3_URL = process.env.S3_URL;
	var S3_IMAGE_PREFIX = 'image';
	var S3_IMAGE_URL = S3_URL + S3_BUCKET + '/' + S3_IMAGE_PREFIX + '/';

/**
 * Create a article with Upload
 */

exports.uploadToS3 = function (req, res) {

 	aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});

    var s3 = new aws.S3();
    var s3_params = {
        Bucket: S3_BUCKET,
        Key: S3_IMAGE_PREFIX + '/' + req.query.file_name,
        Expires: 60,
        ContentType: req.query.file_type,
        ACL: 'public-read'
    };

    s3.getSignedUrl('putObject', s3_params, function(err, data) {

        if (err) {

            console.log(err);
        } else{
            var return_data = {
                signed_request: data,
                url: S3_IMAGE_URL + req.query.file_name
               // url: 'https://'+S3_BUCKET+'.s3.amazonaws.com/image/'+req.query.file_name
            };
            res.write(JSON.stringify(return_data));
            res.end();
        }
    });
};

 exports.createWithUpload =  function(req, res) {

 	console.log ('createWithUpload');

	var form = new multiparty.Form();
	form.parse(req, function(err, fields, files) {

	var file = req.files.file;	
	if (!file) return;
	
	 console.log(file.name);
	 console.log(file.type);
	 console.log(file.path);
	 console.log(req.body.article);

	var art = JSON.parse(req.body.article);
	var article = new Article(art);
	article.user = req.user;
	var tmpPath = file.path;
	var extIndex = tmpPath.lastIndexOf('.');
	var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
	var fileName = uuid.v4() + extension;
	var destPath = './public/uploads/' + fileName;

	article.image = '/uploads/' + fileName;;

	console.log (destPath);
	console.log (tmpPath);

	var is = fs.createReadStream(tmpPath);
	var os = fs.createWriteStream(destPath);

	if(is.pipe(os)) {
	    fs.unlink(tmpPath, function (err) { //To unlink the file from temp path after copy
	    	
	        if (err) {
	            console.log(err);
	        }
	    });
	    article.save(function(err) {

	    	console.log (err);
	    if (err) {
	        return res.status(400).send({
	            message: errorHandler.getErrorMessage(err)
	        });
	    } else {
	        res.jsonp(article);
	    }
	});
	} else
	            console.log('File not uploaded');
	    return res.json('File not uploaded');
	});
};

exports.createWithUpload1 = function(req, res) {
	
	var file = req.files.file;
	console.log(file.name);
	console.log(file.type);
	console.log(file.path);
	console.log(req.body.article);

	var art = JSON.parse(req.body.article);
	var article = new Article(art);
	article.user = req.user;

	fs.readFile(file.path, function (err,original_data) {
	if (err) {
	  return res.status(400).send({
	        message: errorHandler.getErrorMessage(err)
	    });
	} 
	// save image in db as base64 encoded - this limits the image size
	// to there should be size checks here and in client
	var base64Image = original_data.toString('base64');
	fs.unlink(file.path, function (err) {
	  if (err)
	  { 
	      console.log('failed to delete ' + file.path);
	  }
	  else{
	    console.log('successfully deleted ' + file.path);
	  }
	});

	article.image = base64Image;

	article.save(function(err) {
	if (err) {
	    return res.status(400).send({
	        message: errorHandler.getErrorMessage(err)
	    });
	} else {
	    res.json(article);
	}
	});
	});
};

/**
 * Create a article
 */
exports.create = function(req, res) {
	var article = new Article(req.body);
	article.user = req.user;

	article.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(article);
		}
	});
};

/**
 * Show the current article
 */
exports.read = function(req, res) {
	res.json(req.article);
};

/**
 * Update a article
 */
exports.update = function(req, res) {
	var article = req.article;

	article = _.extend(article, req.body);

	article.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(article);
		}
	});
};

/**
 * Delete an article
 */
exports.delete = function(req, res) {
	var article = req.article;

	article.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(article);
		}
	});
};

/**
 * List of Articles
 */
exports.list = function(req, res) {
	Article.find().sort('-created').populate('user', 'displayName').exec(function(err, articles) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(articles);
		}
	});
};

/**
 * Article middleware
 */
exports.articleByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Article is invalid'
		});
	}

	Article.findById(id).populate('user', 'displayName').exec(function(err, article) {
		if (err) return next(err);
		if (!article) {
			return res.status(404).send({
				message: 'Article not found'
			});
		}
		req.article = article;
		next();
	});
};

/**
 * Article authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.article.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};
