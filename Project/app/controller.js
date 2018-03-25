/* jslint node: true */
"use strict";

/*imports*/
var express = require('express');
var router = express.Router();
var model = require("./model.js");
var index= require("./index.js");
var database=index.models;

//handles user login. Finds one user with the given email and password in the database.
//Acts accordingly in each case.
router.post('/userLogin', function (req, res) {
  model.userLogin(req.body.email, req.body.password).then(function(user) {
    if(user == null) {
      console.log("User was not found");
      res.json({Success: false, Message: "User was not found", Data: null});
    } else{
      console.log("User was found");
      res.json({Success: true, Message: "User was found", Data:
        {username : user.dataValues.name, id : user.dataValues.id}});
    }
  });
});

router.post('/createUser', function (req, res) {
  model.findUserByEmail(req.body.email).then(function(user) {
    if(user == null) {
      console.log("No user with that email exists.");
      model.createUser(req.body.username, req.body.email, req.body.password).then(function(newUser) {
        res.json({Success: true, Message: "A new user was created", Data: {
          username: newUser[0].dataValues.name, id: newUser[0].dataValues.id
        }});
      });
    } else {
      console.log("A user with that email exists.");
      res.json({Success: false, Message: "A user with that email already exists", Data: null});
    }
  });
});

router.post('/profileSave', function (req, res) {
    model.updateProfile(req);
});

router.get('/profile/:id',function (req, res) {
  var userId = req.params.id;

  //after matches are returned, we send back the array of matches.
  model.getProfile(userId).then(function(profileInfo){
    console.log("result sent: " + profileInfo);
    res.json({matches:profileInfo});
  });
});

//returns an array of matches for a particular user when they enter their matches page.
router.get('/matches/:id',function (req, res) {
  var userId=req.params.id;

  //after matches are returned, we send back the array of matches.
  model.getMatches(userId).then(function(userRows){
    console.log("result sent: "+userRows+"hey");
    res.json({matches:userRows});
  });
});

router.get('/chat/:id', function(req, res) {
  let chatId = req.params.id;
  let userIds = chatId.split(":");

  model.getMessageHistory(userIds[0], userIds[1]).then(function(messages) {
    if(messages == null) {
      console.log("Didn't find any messages");
      res.json({Success: false, Message: "Didn't find any message history", Data: null})
    } else {
      console.log("Found messages in server");
      res.json({Success: true, Message: "Found message history", Data: messages});
    }
  });
});

//returns an array of matches for a particular user when they enter their matches page.
router.get('/swipeProfiles/:id',function (req, res) {
  var userId=req.params.id;

  //after matches are returned, we send back the array of matches.
  model.getSwipeProfiles(userId).then(function(userRows){
    console.log("swiped profile array: "+userRows);
    res.json({profiles:userRows});
  });
});

module.exports = router;
