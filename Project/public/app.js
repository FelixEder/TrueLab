/* Controls which html page and controller are currently being used. This is used to switch between
the different pages and their controllers*/

(function(){
    var app = angular.module("truelab", [
        'ngRoute',
        'truelabControllers',
        'ui.bootstrap',
        'rzModule'
    ]);

    app.config(['$routeProvider',
        function($routeProvider) {
            $routeProvider.
            when('/listOfMatches', {
                templateUrl: 'views/listOfMatches.html',
                controller: 'listOfMatchesController'
            }).
            when('/userLogin', {
                templateUrl: 'views/userLogin.html',
                controller: 'userLoginController'
            }).
            when('/createUser', {
              templateUrl: 'views/createUser.html',
              controller: 'createUserController'
            }).
            when('/swiper', {
                templateUrl: 'views/swiper.html',
                controller: 'swiperController'
            }).
            when('/editProfile', {
                templateUrl: 'views/editProfile.html',
                controller: 'editProfileController'
            }).
            when('/chat', {
              templateUrl: 'views/chat.html',
              controller: 'chatController'
            }).
            when('/matchProfile', {
                templateUrl: 'views/matchProfile.html',
                controller: 'matchProfileController'
            }).
            //defaults to login page:
            otherwise({
                redirectTo: '/userLogin'
            });
        }]);
})();
