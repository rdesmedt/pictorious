'use strict';

// Pictures controller
angular.module('pictures').controller('PicturesController', ['$scope', '$stateParams',
                                                             '$location', '$upload', '$timeout', 'Authentication',
                                                             'Pictures',
	function($scope, $stateParams, $location, $upload, $timeout, Authentication, Pictures) {
		$scope.authentication = Authentication;


        //List of unique Tags for preemptive text
        $scope.loadTags = function(query) {
            console.log('LOADTAGS HIT! ' + query);
            //$scope.loadTags = Pictures.query();
        };


        //preload picture and show preview thumb
        $scope.generateThumb = function(file) {
            if (file) {
                console.log(file.type.indexOf('image'));
                if (file.type.indexOf('image') > -1) {
                    $timeout(function() {
                        var fileReader = new FileReader();
                        fileReader.readAsDataURL(file);
                        fileReader.onload = function(e) {
                            $timeout(function() {
                                file.dataUrl = e.target.result;
                            });
                        };
                    });
                }
            }
        };

        // save picture to server
        $scope.uploadPic = function(files, picName){
            console.log('UPLOAD GEHIT!: ' + $scope.tags.length);
            if (files && files.length) {
                if($scope.tags.length && $scope.tags.length < 4) {

                    var tags = $scope.tags;
                    var file = files[0];

                    $upload.upload({
                        url: '/pictures',
                        fields: {'picTitle': picName, 'tags': tags},
                        file: file
                    }).progress(function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                    }).success(function (data, status, headers, config) {
                        console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                        $location.path('pictures');
                    });
                }
            }
        };

		// Remove existing Picture
		$scope.remove = function(picture) {
			if ( picture ) { 
				picture.$remove();

				for (var i in $scope.pictures) {
					if ($scope.pictures [i] === picture) {
						$scope.pictures.splice(i, 1);
					}
				}
			} else {
				$scope.picture.$remove(function() {
					$location.path('pictures');
				});
			}
		};

		// Update existing Picture
		$scope.update = function() {
			var picture = $scope.picture;

			picture.$update(function() {
				$location.path('pictures/' + picture._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Pictures
		$scope.find = function() {
			$scope.pictures = Pictures.query();
		};

		// Find existing Picture
		$scope.findOne = function() {
			$scope.picture = Pictures.get({ 
				pictureId: $stateParams.pictureId
			});
		};
	}
]);
