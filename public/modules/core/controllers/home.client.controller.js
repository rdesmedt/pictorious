'use strict';


angular.module('core').controller('HomeController', ['$scope', '$http', '$location', 'Authentication', 'Pictures',
	function($scope, $http, $location, Authentication, Pictures) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

        //List of unique Tags for preemptive text
        $scope.loadTags = function(query) {
            return $http({
                url: '/pictureTags',
                method: 'GET',
                params: query
            });
        };

        // Find a list of Pictures
        $scope.find = function() {
            $scope.pictures = Pictures.query();
        };

        // Find a list of pictures with a certain tag
        $scope.findTagPictures = function(){


            if($scope.tags.length < 1){
                $http({
                    url: '/pictures',
                    method: 'GET'
                })
                    .success(function (data) {

                        console.log('SUCCESS: ' + data);
                        $scope.pictures = data;
                    });
            }
            else {
                var tag = $scope.tags[0].tag;

                console.log('FINDTAGPICTURES HIT: ' + tag);
                $http({
                    url: '/pictures/tag/' + tag,
                    method: 'GET',
                    params: tag
                })
                    .success(function (data) {

                        console.log('SUCCESS: ' + data);
                        $scope.pictures = data;
                    });
            }
        };

        // Cast upvote
        $scope.upvote = function(id) {
            $http({
                url: '/pictures/' + id + '/upvote',
                method: 'PUT',
                data: $scope.picture
            })
                .success(function (data) {

                    console.log('SUCCESS: ' + data);
                    $scope.pictures = data;
                });

        };

        // Cast downvote
        $scope.downvote = function(id) {
            $http({
                url: '/pictures/' + id + '/downvote',
                method: 'PUT',
                data: $scope.picture
            })
                .success(function (data) {

                    console.log('SUCCESS: ' + data);
                    $scope.pictures = data;
                });

        };
	}
]);
