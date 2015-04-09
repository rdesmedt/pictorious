'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', 'Pictures',
	function($scope, Authentication, Pictures) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

        // Find a list of Pictures
        $scope.find = function() {
            $scope.pictures = Pictures.query();
        };
	}
]);
