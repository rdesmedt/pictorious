'use strict';


angular.module('core').controller('HomeController', ['$scope', '$http', '$location', 'Authentication', 'Pictures',
	function($scope, $http, $location, Authentication, Pictures) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
        $scope.upvoteDisable = false;
        $scope.downvoteDisable = false;


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

                        $scope.pictures = data;
                    });
            }
            else {
                var tag = $scope.tags[0].tag;

                $http({
                    url: '/pictures/tag/' + tag,
                    method: 'GET',
                    params: tag
                })
                    .success(function (data) {
                        $scope.pictures = data;
                    });
            }
        };

        // Cast upvote
        $scope.upvote = function(id) {
            if($scope.tags.length){
                var tag = $scope.tags[0].tag;
                $http({
                    url: '/pictures/' + id + '/upvote',
                    method: 'PUT',
                    data: $scope.picture
                })
                    .success(function (data) {
                        var tag = $scope.tags[0].tag;

                        $http({
                            url: '/pictures/tag/' + tag,
                            method: 'GET',
                            params: tag
                        })
                            .success(function (data) {
                                $scope.pictures = data;
                            });
                    });
            }else{
                $http({
                    url: '/pictures/' + id + '/upvote',
                    method: 'PUT',
                    data: $scope.picture
                })
                    .success(function (data) {
                        $scope.pictures = data;
                    });
            }
        };

        // Cast downvote
        $scope.downvote = function(id) {
            if($scope.tags.length){
                var tag = $scope.tags[0].tag;
                $http({
                    url: '/pictures/' + id + '/downvote',
                    method: 'PUT',
                    data: $scope.picture
                })
                    .success(function (data) {
                        var tag = $scope.tags[0].tag;

                        $http({
                            url: '/pictures/tag/' + tag,
                            method: 'GET',
                            params: tag
                        })
                            .success(function (data) {
                                $scope.pictures = data;
                            });
                    });
            }else{
                $http({
                    url: '/pictures/' + id + '/downvote',
                    method: 'PUT',
                    data: $scope.picture
                })
                    .success(function (data) {
                        $scope.pictures = data;
                    });
            }


        };

        // vote disable if casted
        $scope.voteDisable = function(vote, user){
            var i = null;
            for(i = 0; vote.length > i ; i++){
                if(vote[i].user === user._id){
                    return true;
                }
            }
            return false;
        };

        // set class for vote buttons
        $scope.voteClass = function(vote, user){
            var i = null;
            for(i = 0; vote.length > i ; i++){
                if(vote[i].user === user._id){
                    return 'btn-primary';
                }
            }
            return '';
        };
	}
]);


