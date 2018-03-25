/** Contains the controllers that handle the logic for model/view for each page */

var truelabControllers = angular.module('truelabControllers', []);

truelabControllers.controller('userLoginController', ['$scope', 'HttpService', '$location', 'UserService',
  function($scope, http, $location, user) {
    $scope.email = "";
    $scope.password = "";

    $scope.done = function() {
      if($scope.email == "" || $scope.password == "") {
        console.log("Error, email or password not entered.");
        alert("Error, email or password not entered.");
        return;
      }
      console.log("Reached done()");
      http.post('/userLogin', {email: $scope.email, password: $scope.password}, function(response) {
        console.log("Server response: " + response);
        if(response.Success) {
          console.log("successful response");
          user.setUserName(response.Data.username);
          user.setId(response.Data.id);

          //changes location to swiper page
          $location.path("swiper");

        } else {
          console.log("Error, user not found in database.");
          alert("Error, user not found in database.");
          $scope.email = "";
          $scope.password = "";
        }
      });
    };

    $scope.click = function() {
      $location.hash("");
      $location.path('/createUser');
      $scope.location = $location.path();
      console.log("location = " + $scope.location);
    };
  }
]);

truelabControllers.controller('createUserController', ['$scope', 'HttpService', '$location', 'UserService',
  function($scope, http, $location, user) {
    $scope.username = "";
    $scope.email = "";
    $scope.password1 = "";
    $scope.password2 = "";

    $scope.done = function() {
      if($scope.username == "" || $scope.email == "" || $scope.password1 == "" ||  $scope.password2 == "") {
        console.log("Error, email or passwords not entered.");
        alert("Error, email or passwords not entered.");
        $scope.password1 = "";
        $scope.password2 = "";
        return;
      }
      else if($scope.password1 !== $scope.password2) {
        console.log("Passwords were not equal to each other!");
        alert("Error, password-fields need to be equal to each other");
        $scope.password1 = "";
        $scope.password2 = "";
        return;
      }
      http.post('/createUser', {username: $scope.username, email: $scope.email, password: $scope.password1}, function(response) {
        console.log("Server response: " + response);
        if(response.Success) {
          console.log(response.Message);
          user.setId(response.Data.id);
          user.setUserName(response.Data.username);

          //changes location to swiper page
          $location.path("swiper");

        } else {
          console.log(response.Message);
          alert("There is already an account with that email");
          $scope.username = "";
          $scope.email = "";
          $scope.password1 = "";
          $scope.password2 = "";
        }
      });
    };

    //This function should direct the user to the wanted page
    $scope.back = function() {
        $location.hash("");
        $location.path('/' + 'userLogin');
        $scope.location = $location.path();
        console.log("location = " + $scope.location);
    };
  }
]);

truelabControllers.controller('listOfMatchesController', ['$scope', 'HttpService', '$location', 'UserService', 'productService',
    function($scope, http, $location, user, productService) {

        if(user.getId()==="" && user.getUserName()=== ""){
            $location.path('/userLogin');
        }

        console.log("In listOfMatches controller.");

       //init socket connection.
        var socket=io();

        //init the variable which will store matches
        //Each element represents a user object e.g. {name: id: email: }
        $scope.matches = [];

        //set local scope user info variables.
        $scope.userId=user.getId();
        $scope.username=user.getUserName();

        //once you join the matches list subscribe to any possible new matches that might come. :)
        socket.emit('joinMatches',{id:$scope.userId});

        //define function that receives update on the list of matches and changes the list accordingly
        //->occurs when a new match to this user is made or a match is deleted.
        socket.on('updateMatches', function (data) {
            $scope.$apply(function(){
                $scope.getMatches();
            });
        });


        $scope.getMatches=function getMatches(){
            //Fetch the initial matches array from the database.

            http.get("/matches/"+$scope.userId, function(response) {

                console.log("Matches received: "+response.matches);
                //sets our array to the matches array sent in the response
                $scope.matches=response.matches;
            });
        };

        //call the function and update your matches soon as you get in.
        $scope.getMatches();

        $scope.lodeProfile=function(req){
            productService.addProduct(req.id);
            productService.addProduct(req.name);
            $location.path('/matchProfile');

        }

        $scope.lodeChat=function(req){
            productService.addProduct(req.id);
            productService.addProduct(req.name);
            $location.path('/chat');
        }


    }
]);

truelabControllers.controller('swiperController', ['$scope', 'HttpService', '$location', 'UserService', '$window', '$timeout',
    function($scope, http, $location, user, $window, $timeout) {

        if(user.getId()==="" && user.getUserName()=== ""){
            $location.path('/userLogin');
        }

        var socket=io();

        //list of users;
        $scope.profileList=[];
        $scope.currentProfile=[];
        $scope.userId=user.getId();
        var prevUser="";


        $scope.moreProfiles=function(){
            $scope.getProfiles();
        };

    $scope.matchedUser="";

    socket.emit('joinSwipe',{id:$scope.userId});

    $scope.matchedMessage=function(username){return "You matched with"+ username+" !"};

        //fetches profiles
        var getProfiles=$scope.getProfiles=function(){
            http.get("/swipeProfiles/"+$scope.userId, function(response) {
                console.log("Profiles received: "+response.profiles);
                $scope.profileList=response.profiles;
                    //if there are users left to swipe
                    $scope.showSwiper=false;
                    $scope.pop();
                    console.log(JSON.stringify("HERE"+JSON.stringify($scope.currentProfile)));
            });
        };

       $scope.getProfiles();

        //help function.
        $scope.pop= function(){

            console.log("POP CALLED!");

            if ($scope.profileList != undefined && $scope.profileList.length>0) {
                $scope.showSwiper=true;
                $scope.currentProfile=$scope.profileList[0];
                $scope.profileList=$scope.profileList.slice(1);
            }

            else{
                $scope.currentProfile=null;
                $scope.showSwiper=false;
            }
        };

    //swipes yes
    $scope.yes = function() {
        prevUser=$scope.currentProfile;

        if ($scope.currentProfile!=null) {
            socket.emit('like', {uId1: $scope.userId, uId2: $scope.currentProfile.id});
        }

        console.log("YES CALLED");
        if ($scope.currentProfile!=null){
            $scope.pop();
        }
    };

    //swipes no
    $scope.no = function() {
        prevUser=$scope.currentProfile;

        if($scope.currentProfile!=null) {
            socket.emit('dislike', {uId1: $scope.userId, uId2: $scope.currentProfile.id});
        }
        console.log("NO CALLED");

        if ($scope.currentProfile!=null){
            $scope.pop();
        }
    };

        //shows the you matched message for 10 sec or so!
        $scope.showMatchedMessage = function(username) {
            $scope.matchedMessage= "You matched with "+username+"!";
            console.log($scope.matchedMessage);
            $scope.showMatched = true;
            $timeout(function(){
                $scope.showMatched = false;
            }, 2000);
        };

        //called by server when you match with someone :)
        socket.on('showMatchedMessage', function (data) {
            $scope.$apply(function(){
                console.log("Show matched message");
                $scope.showMatchedMessage(prevUser.name);
            });
        });
    }
]);

truelabControllers.controller('chatController', ['$scope', 'HttpService', '$routeParams', 'UserService', 'productService','$location',
  function($scope, http, $routeParams, user, productService,$location) {

    if(user.getId()==="" && user.getUserName()=== ""){
        $location.path('/userLogin');
    }

    $scope.data = productService.getProducts();
    productService.clearList();

    $scope.id1 = user.getId();
    $scope.name1 = user.getUserName();
    $scope.id2  = $scope.data[0];
    $scope.name2 = $scope.data[1];

    var socket = io();

    http.get("/chat/" + $scope.id1 + ":" + $scope.id2, function(response) {
      console.log("Response from server: " + response);

      if(response.Success) {
        console.log("Request successful");
        console.log("Response-data: " + response.Data);

        for(let i = 0; i < response.Data.length; i++) {
            if(response.Data[i].from == user.getId()) {
                response.Data[i].message = "You: " + response.Data[i].message;
            } else {
            response.Data[i].message = $scope.data[1] + ": " + response.Data[i].message;
            }
        }

        $scope.messages = response.Data;
        socket.emit("joinChatRoom", {user1Id: user.getId(), user2Id: $scope.id2});
      } else {
        console.log("Request unsuccessful");
      }
    });

    socket.on('updateChatRoom', function(data) {
        $scope.$apply(function() {
        console.log("updateChatRoom");
        console.log(data);
        if(data.name === user.getUserName()) {
            data.message = "You: " + data.message;
        } else {
            data.message = data.name + ": " + data.message;
        }
        console.log("Message: " + data.message);
        $scope.messages.push(data);
      });
    });

    $scope.send = function() {
      console.log("Reached send()");
      console.log("Value of mess: " + $scope.mess);
      socket.emit("updateChatRoom", {name: user.getUserName(), user1Id: user.getId(),
         user2Id: $scope.id2, message: $scope.mess});
      $scope.mess = "";
    };

      //This function should direct the user to the wanted page
      $scope.back = function() {
          $location.hash("");
          $location.path('/' + 'listOfMatches');
          $scope.location = $location.path();
          console.log("location = " + $scope.location);
      };

  }
]);

truelabControllers.controller('editProfileController', ['$scope', 'HttpService', '$location', 'UserService','$window', '$timeout',
    function($scope, http, $location, user,$window,$timeout) {
        if(user.getId()==="" && user.getUserName()=== ""){
            $location.path('/userLogin');
        }

        //init socket connection.
        var socket=io();

        $scope.userId=user.getId();
        $scope.username=user.getUserName();

        $scope.biography="";
        $scope.seeking="";
        $scope.ambition="";
        $scope.showSaved = false;

        http.get("/profile/" + $scope.userId , function(response) {
            console.log("Profile received: "+response.matches);
            //sets our array to the matches array sent in the response
            $scope.biography=response.matches.biography;
            $scope.seeking=response.matches.seeking;
            $scope.ambition=response.matches.ambition;
        });

        $scope.done=function(){

            var updated=false;

            http.post('/profileSave', {id: $scope.userId, biography: $scope.biography,
               seeking: $scope.seeking, ambition: $scope.ambition}, function(response) {

                console.log("Server response: " + response);
                console.log("Saved notification!");

                if(response.Success) {
                    console.log("successful response");
                } else {
                    console.log("Error, user not found in database.");
                    alert("Error, user not found in database.");
                }

            });

            //notifies user that you've saved the profile
            $scope.showSaved = true;
            $timeout(function(){
                $scope.showSaved = false;
            }, 1000);
        };
    }
]);

// Controls the navigation bar that will be removed later
truelabControllers.controller('navigationController', ['$scope',  '$location',
    function($scope,  $location) {
        $scope.location = $location.path();

        //This function should direct the user to the wanted page
        $scope.redirect = function(address) {
            $location.hash("");
            $location.path('/' + address);
            $scope.location = $location.path();
            console.log("location = " + $scope.location);
        };

    }
]);


truelabControllers.controller('matchProfileController', ['$scope', 'HttpService', '$location', 'UserService', 'productService',
    function($scope, http, $location, user, productService) {
        if(user.getId()==="" && user.getUserName()=== ""){
            $location.path('/userLogin');
        }

        $scope.data = productService.getProducts();
        productService.clearList();

        var socket=io();

        $scope.userId=$scope.data[0];
        $scope.username=$scope.data[1];

        $scope.biography="";
        $scope.seeking="";
        $scope.ambition="";

        http.get("/profile/" + $scope.userId , function(response) {
            console.log("Matches received: "+response.matches);
            //sets our array to the matches array sent in the response
            $scope.biography=response.matches.biography;
            $scope.seeking=response.matches.seeking;
            $scope.ambition=response.matches.ambition;
        });

        //This function should direct the user to the wanted page
        $scope.back = function() {
            $location.hash("");
            $location.path('/' + 'listOfMatches');
            $scope.location = $location.path();
            console.log("location = " + $scope.location);
        };

    }
]);
