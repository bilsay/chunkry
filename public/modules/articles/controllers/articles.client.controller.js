'use strict';

// Articles controller
angular.module('articles').controller('ArticlesController', ['$scope', '$timeout', 'Upload', '$http', '$stateParams', '$location', 'Authentication', 'Articles',
	function($scope, $timeout, $upload, $http, $stateParams, $location, Authentication, Articles) {
		
		$scope.usingFlash = FileAPI && FileAPI.upload != null;
		$scope.fileReaderSupported = window.FileReader !== null;
		$scope.authentication = Authentication;
		$scope.invalidFiles = [];

	/*	$scope.uploadPic = function(e, s){
		    console.log(e.target.files[0]);
		    $scope.image =e.target.files[0];
		};

		$scope.$watch('files', function (files) {
			$scope.formUpload = false;
			if (files != null) {
			  if (!angular.isArray(files)) {
			    $timeout(function () {
			      $scope.files = files = [files];
			    });
			    return;
			  }
			  for (var i = 0; i < files.length; i++) {
			    $scope.errorMsg = null;
			    (function (f) {
			      $scope.upload(f, true);
			    })(files[i]);
			  }
			}
		});*/

		function s3_uploadImage (file) {
			s3_getSignedRequest (file);
		}

		function s3_getSignedRequest (file){

			var xhr = new XMLHttpRequest();

			xhr.open("GET", "/sign_s3?file_name="+file.name+"&file_type="+file.type);

			xhr.onreadystatechange = function(){
			    if(xhr.readyState === 4){
			        if(xhr.status === 200){
			            var response = JSON.parse(xhr.responseText);
			            s3_uploadFile(file, response.signed_request, response.url);
			        }
			        else{
			            console.log("Could not get signed URL.");
			        }
			    }
			};

			xhr.send();
		}

		function s3_uploadFile (file, signed_request, url) {

			var xhr = new XMLHttpRequest();
			
			xhr.open("PUT", signed_request);
			xhr.setRequestHeader('x-amz-acl', 'public-read');

			xhr.onload = function() {
			    if (xhr.status === 200) {
			    	$scope.imageUrl = url;
			        $('#chunk-image').attr ('src', url)
			        				 .removeClass('ng-hide');

					$('#create-chunk-button').removeAttr ('disabled');
			    }
			};
			
			xhr.onerror = function() {
			    console.log("Could not upload file.");
			};

			xhr.send(file);
		}

		var saveArticle = function (article) {

			article.$save (function (response) {

				//$location.path('articles/' + response._id);

				// Clear form fields
				$scope.title = '';
				$scope.content = '';
				$scope.tags = [];
				$scope.imageUrl = null;
				
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		}

		// Create new Article
		$scope.create = function() {

			var article = new Articles({
				title: this.title,
				content: this.content,
				tags: this.tags,
            	imageUrl: this.imageUrl
			});

			saveArticle (article);
		};

		$scope.create2 = function(image) {

			console.log ('create');

			// Create new Article object
			var article = new Articles({
				title: this.title,
				content: this.content,
				tags: this.tags,
            	image: null
			});

  			$upload.upload({
	            url: '/articleupload', 
	            method: 'POST', 
	            headers: {'Content-Type': 'multipart/form-data'},
	            fields: { article: article },
	            file: this.image,               
	        }).success(function (response, status) {
	              
	            $location.path('articles/' + response._id);

	            $scope.title = '';
	            $scope.content = '';
				$scope.tags = [];
				$scope.image = null;
	        }).error(function (err) {

	        	console.log (err.data);
	        	if (err.data) {

	                $scope.error = err.data.message;
	        	}
	        });

			// Redirect after save
		/*article.$save(function(response) {
				$location.path('articles/' + response._id);

				// Clear form fields
				$scope.title = '';
				$scope.content = '';
				$scope.tags = [];
				
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});*/
		};

		$scope.uploadImage = function (image) {

			$('#create-chunk-button').attr ('disabled', true);

			if (image) {
				if ($scope.fileReaderSupported && image.type.indexOf('image') > -1) {
				   
					s3_uploadImage(image);
				}	
			}
		};

		// Remove existing Article
		$scope.remove = function(article) {
			if (article) {
				article.$remove();

				for (var i in $scope.articles) {
					if ($scope.articles[i] === article) {
						$scope.articles.splice(i, 1);
					}
				}
			} else {
				$scope.article.$remove(function() {
					$location.path('articles');
				});
			}
		};

		// Update existing Article
		$scope.update = function() {
			var article = $scope.article;

			if ($scope.imageUrl) {
				article.imageUrl = 	$scope.imageUrl;
			}

			article.$update(function() {
				$location.path('articles/' + article._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Articles
		$scope.find = function(tag) {

			Articles.query({}, function (allArticles) {

				var tag = $stateParams.tag;

				if(tag) {

					var taggedArticles = [];

					_.each (allArticles,  function (article) {

						if (article.tags) {

							for (var i = 0; i < article.tags.length; i++) {

								var articleTag = article.tags[i];

								if (tag == articleTag.text) {
									taggedArticles.push (article);
								} 
							}
						}
					});

					console.log (taggedArticles);

					$scope.articles = taggedArticles;
				} else {

					$scope.articles = allArticles;
				}	


			});
			
		};

		// Find existing Article
		$scope.findOne = function() {

			$scope.article = Articles.get({
				articleId: $stateParams.articleId
			});
		};

		$scope.tags = [
            { text: 'just' },
            { text: 'some' },
            { text: 'cool' },
            { text: 'tags' }
        ];

 		$scope.loadTagCloudItems = function(query) {

 			var articles = Articles.query({}, function (articles) {

	 			var tagCloudItems = {};

	 			_.each (articles, function (article) {
	 				
	 				_.each (article.tags, function (tag) {

	 					if (!tagCloudItems[tag.text]) {
	 						tagCloudItems[tag.text] = 0;
	 					} 

	 					tagCloudItems[tag.text]++;
	 				});
	 			});

	            $scope.tagCloudItems = sortProperties(tagCloudItems); 
 			});
        };

		function sortProperties(obj)
		{
			// convert object into array
			var sortable=[];
			for(var key in obj)
			    if(obj.hasOwnProperty(key))
			        sortable.push([key, obj[key]]); // each item is an array in format [key, value]

			// sort items by value
			sortable.sort(function(a, b)
			{
			  return -(a[1]-b[1]); // compare numbers
			});

			return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
		}
    	$scope.tagged = function(tag) {
            
			$scope.articles = Articles.query({tags: tag});
        };

        $scope.loadTags = function(query) {
            return $http.get('/#!/articles/tags?query=' + query);
        };

         angular.element(document).ready(function () {

         	setTimeout(function () {

	    	   $(".tag-cloud").tx3TagCloud({
					multiplier: 2
				});
         	}, 1000);

    	 });
	}
]);