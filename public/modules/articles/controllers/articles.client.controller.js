'use strict';

// Articles controller
angular.module('articles').controller('ArticlesController', ['$scope', '$timeout', 'Upload', '$http', '$stateParams', '$location', 'Authentication', 'Articles',
	function($scope, $timeout, $upload, $http, $stateParams, $location, Authentication, Articles) {
		
		$scope.usingFlash = FileAPI && FileAPI.upload != null;
		$scope.fileReaderSupported = window.FileReader !== null;
		$scope.authentication = Authentication;
		$scope.invalidFiles = [];

		var addChunkTagHandlers = {

			"book": function (chunk) {

				$('#chunk-add-book-isbn').removeClass ('hide');
			}
		};

		var removeChunkTagHandlers = {

			"book": function (chunk) {

				$('#chunk-add-book-isbn').addClass ('hide');
			}
		};

		var processChunkTags = function (chunk) {

			return _.each (chunk.tags, processSpecialChunkTag);
		};

		var addChunkTag = function (tag) {

			var chunkTagHandler = addChunkTagHandlers[tag.text];

			if (chunkTagHandler) {
				chunkTagHandler ();
			}
		};

		var removeChunkTag = function (tag) {

			var chunkTagHandler = removeChunkTagHandlers[tag.text];

			if (chunkTagHandler) {
				chunkTagHandler ();
			}
		};

		var getFileTypeCategory = function (fileType) {

			if (!fileType) return;

			if ((/(gif|jpg|jpeg|tiff|png)$/i).test(fileType)) {

				return 'image';
			} else if ((/(mp3|wav)$/i).test(fileType)) {

				return 'audio';
			}
		};

		var isAcceptableType = function (fileType) {

			return (/(gif|jpg|jpeg|tiff|png|mp3|wav)$/i).test(fileType);
		}

		function s3_getSignedRequest (file){

			var xhr = new XMLHttpRequest();
			var fileTypeCategory = getFileTypeCategory (file.type);

			if (!fileTypeCategory) return;

			xhr.open("GET", "/sign_s3?file_name=" + file.name 
								  + "&file_type=" + file.type 
								  + "&file_type_category=" + fileTypeCategory
								  + "&user_name=" + ($scope.authentication.user.username));

			xhr.onreadystatechange = function(){
			    if(xhr.readyState === 4){
			        if(xhr.status === 200){
			            var response = JSON.parse(xhr.responseText);
			            s3_uploadFile(file, response.signed_request, response.url, fileTypeCategory);
			        }
			        else{
			            console.log("Could not get signed URL.");
			        }
			    }
			};

			xhr.send();
		}

		function s3_uploadFile (file, signed_request, url, fileTypeCategory) {

			var xhr = new XMLHttpRequest();
			
			xhr.open("PUT", signed_request);
			xhr.setRequestHeader('x-amz-acl', 'public-read');

			xhr.onload = function() {
			    if (xhr.status === 200) {
			    	
			    	$scope.article.fileUrl = url;
			    	$scope.article.fileTypeCategory = fileTypeCategory;
					saveArticle ($scope.article);
			    }
			};
			
			xhr.onerror = function() {

			    console.log("Could not upload file.");
			};

			xhr.send(file);
		}

		var saveArticle = function (article) {

			//processSpecialChunkTags (article);

			article.$save (function (response) {

				//$location.path('articles/' + response._id);
				$location.path('articles/' + response._id);
				// Clear form fields

				$scope.isCreatedByUser = false;
				$scope.title = '';
				$scope.content = '';
				$scope.tags = [];
				$scope.fileUrl = '';
				$scope.fileTypeCategory = '';
				$scope.article = null;
				
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		}

		// Create new Article
		$scope.create = function() {

			var article = new Articles({
				isCreatedByUser: this.isCreatedByUser,
				title: this.title,
				content: this.content,
				linkUrl: this.linkUrl,	
				tags: this.tags
			});

			if (this.file) {

				$scope.article = article;
				uploadFile (this.file);
			} else {
				saveArticle (article);
			}
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

		var uploadFile = function (file) {

			$('#create-chunk-button').attr ('disabled', true);

			if (file) {
				if ($scope.fileReaderSupported 
					&& isAcceptableType(file.type)){
				   
					s3_getSignedRequest (file);
				}	
			}
		};

		$scope.generatePreview = function (file) {

			if (file) {
				if ($scope.fileReaderSupported 
					&& isAcceptableType(file.type)){
				   
					var fileReader = new FileReader();
					var fileTypeCategory = getFileTypeCategory(file.type);

					fileReader.onload = function(fileLoadedEvent) 
					{
						$('#chunk-' + fileTypeCategory + '-preview').attr ('src', fileLoadedEvent.target.result)
																	.show ();

						//textAreaFileContents.innerHTML = fileLoadedEvent.target.result;
					};

					fileReader.readAsDataURL(file);
				}	
			}
		};

		$scope.tagAdded = function (tag) {

			addChunkTag(tag);
		};

		$scope.tagRemoved = function (tag) {

			removeChunkTag(tag);
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

			if ($scope.fileUrl) {
				article.fileUrl = 	$scope.fileUrl;
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

				_.sortBy($scope.articles, function(o) { return o.created; });

				$scope.hasArticles = 0 != allArticles.length;
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

        	//return $scope.tags;
          // return $http.get('/#!/articles/tags?query=' + query);
           return $http.get('/tags?query=' + query).then(function(response) { 

            	console.log (response);
            	return response.data;
            });/**/
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