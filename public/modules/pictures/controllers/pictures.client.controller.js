'use strict';

// Pictures controller
angular.module('pictures').controller('PicturesController', ['$scope', '$stateParams',
                                                             '$location', '$upload', '$timeout', 'Authentication',
                                                             'Pictures',
	function($scope, $stateParams, $location, $upload, $timeout, Authentication, Pictures) {
		$scope.authentication = Authentication;

        $scope.generateThumb = function(file) {
            if (file != null) {
                console.log(file.type.indexOf('image'));
                if (file.type.indexOf('image') > -1) {
                    console.log('GENERATE THUMB HIT: ' + file);
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

        $scope.uploadPic = function(files){
            console.log('UPLOAD GEHIT!');
            if (files && files.length) {
                    var file = files[0];
                    console.log(file);
                    $upload.upload({
                        url: '/pictures',
                        file: file
                    }).progress(function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                    }).success(function (data, status, headers, config) {
                        console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                        $location.path('pictures')
                    });
            }
        };

		// Create new Picture
		$scope.create = function() {
            console.log('CREATE GEHIT!');
			// Create new Picture object
			var picture = new Pictures ({
				name: this.name
			});

			// Redirect after save
			picture.$save(function(response) {
				$location.path('pictures/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
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
