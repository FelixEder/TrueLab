
/* This is one big self-calling function. This file contains all factories, which are basically services or home-made
functions that when defined can then be injected as dependencies to controllers, modules, etc. */

(function() {

    var truelab=angular.module('truelab');

        //Stores information about the user that is currently logged in
        truelab.factory('UserService', function($http) {


            //user properties:
            var username="";
            var id = "";
            var userBio = "";
            var userEmail="";


            //functions:
            return {

                getUserName: function() {
                    return username;
                },

                setUserName: function(name) {
                    username = name;
                },

                getId: function() {
                    return id;
                },

                setId: function(ID) {
                    id = ID;
                },

                getUserBio : function() {
                    return userBio;
                },

                setUserBio: function(bio) {
                    userBio = bio;
                },

                clearData: function() {
                    var username = "";
                    var id = "";
                    var userBio = "";
                }
            }//return

        }); //userService


        //Defines post and get http methods.
        truelab.factory('HttpService', function($http) {
            return {
                post: function(path, data, callback){
                    $http.post('/API/' + path, data, {withCredentials: true}).success(callback);
                },
                get: function(path, callback){
                    $http.get('/API/' + path).success(callback);
                }
            };
        });

        truelab.factory('productService', function($http) {
            var productList = [];
          
            return {
                addProduct: function(newObj) {
                    productList.push(newObj);
                },
                getProducts: function(){
                    return productList;
                },
                clearList: function (){
                    productList = [];
                }
            };
        });
})();
