'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'pictorious';
	var applicationModuleVendorDependencies = ['ngResource', 'ngCookies',  'ngAnimate',  'ngTouch',  'ngSanitize',  'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload', 'ngTagsInput'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('pictures');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});

	}
]);

'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus',
	function($scope, Authentication, Menus) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
	}
]);
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



'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						uiRoute: menuItemUIRoute || ('/' + menuItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
]);
'use strict';

// Configuring the Articles module
angular.module('pictures').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Pictures', 'pictures', 'dropdown', '/pictures(/create)?');
		Menus.addSubMenuItem('topbar', 'pictures', 'List Pictures', 'pictures');
		Menus.addSubMenuItem('topbar', 'pictures', 'New Picture', 'pictures/create');
	}
]);
'use strict';

//Setting up route
angular.module('pictures').config(['$stateProvider',
	function($stateProvider) {
		// Pictures state routing
		$stateProvider.
		state('listPictures', {
			url: '/pictures',
			templateUrl: 'modules/pictures/views/list-pictures.client.view.html'
		}).
		state('createPicture', {
			url: '/pictures/create',
			templateUrl: 'modules/pictures/views/create-picture.client.view.html'
		}).
		state('viewPicture', {
			url: '/pictures/:pictureId',
			templateUrl: 'modules/pictures/views/view-picture.client.view.html'
		}).
		state('editPicture', {
			url: '/pictures/:pictureId/edit',
			templateUrl: 'modules/pictures/views/edit-picture.client.view.html'
		}).
        state('listTags', {
                url: '/pictureTags'
            });
	}
]);

'use strict';

// Pictures controller
angular.module('pictures').controller('PicturesController', ['$scope', '$stateParams', '$http',
                                                             '$location', '$upload', '$timeout', 'Authentication',
                                                             'Pictures',
	function($scope, $stateParams, $http, $location, $upload, $timeout, Authentication, Pictures) {
		$scope.authentication = Authentication;

        //List of unique Tags for preemptive text
        $scope.loadTags = function(query) {
        return $http({
            url: '/pictureTags',
            method: 'GET',
            params: query
        });
        };


        //preload picture and show preview thumb
        $scope.generateThumb = function(file) {
            if (file) {
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
                    }).success(function (data, status, headers, config) {
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

        // Find a list of Pictures
        $scope.findPicsByUser = function() {
            $http({
                url: '/picturesUser',
                method: 'GET'
            })
                .success(function(data){
                    $scope.pictures = data;
                });

        };

		// Find existing Picture
		$scope.findOne = function() {
			$scope.picture = Pictures.get({ 
				pictureId: $stateParams.pictureId
			});

		};

        // Cast upvote
        $scope.upvote = function(id) {
            $http({
                url: '/pictures/' + id + '/upvoteImg',
                method: 'PUT',
                data: $scope.picture
            })
                .success(function (data) {

                    $scope.picture = data;
                });

        };

        // Cast downvote
        $scope.downvote = function(id) {
            $http({
                url: '/pictures/' + id + '/downvoteImg',
                method: 'PUT',
                data: $scope.picture
            })
                .success(function (data) {

                    $scope.picture = data;
                });

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

        $scope.postComment = function (id, comment){
            console.log("COMMENT POST: " + id + ' - ' + comment);
            $http({
                url: '/pictures/' + id + '/comment',
                method: 'PUT',
                data: comment
            })
        }
	}
]);

'use strict';

//Pictures service used to communicate Pictures REST endpoints
angular.module('pictures').factory('Pictures', ['$resource',
	function($resource) {
		return $resource('pictures/:pictureId', { pictureId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		});
	}
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) {$location.path('/');}



		$scope.signup = function() {

            //If passwords don't match if(!$scope.credentials)
            console.log($scope.credentials);
            if (/*$scope.credentials &&*/ $scope.credentials.password === $scope.credentials.passwordCtrl) {

                $http.post('/auth/signup', $scope.credentials).success(function (response) {
                    // If successful we assign the response to the global user model
                    $scope.authentication.user = response;

                    // And redirect to the index page
                    $location.path('/');
                }).error(function (response) {
                    $scope.error = response.message;
                });
            }else{
                $scope.error = 'Passwords don\'t match!';
            }
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [
	function() {
		var _this = this;

		_this._data = {
			user: window.user
		};

		return _this._data;
	}
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);