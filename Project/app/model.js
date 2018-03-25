/* jslint node: true */
"use strict";

/*imports*/
var index=require('./index.js');
//allows you to access database models
var Promise=require('promise');

//Returns an array containing all the IDs of all users that have matched with (the user with the userID given in the parameter).
var getMatchIds=exports.getMatchIds= function(userId) {
  return new Promise(function(resolve,reject) {
    index.database.matches.findAll({
      where: {
        $or: [{uId1: userId}, {uId2: userId}]
      }
    }).then(matches => {
      var matchIds = [];
      for (var i = 0; i < matches.length; i++) {
        var id1 = matches[i].uId1;
        var id2 = matches[i].uId2;

        console.log( i+" "+ id1+" "+id2);

        if (id1 == userId) {
            matchIds.push(id2);
        }
        else {
            matchIds.push(id1)
        }//else
      }//for
      resolve(matchIds);
    });
  }); //promise
}; //getMatches

//returns one user row from the table users that has the parameter ID. The whole row is returned.
var getUserFromId=exports.getUserFromId=function getUserFromId(userId){
  return new Promise(function(resolve){
    index.database.users.findOne({where: {id:userId},attributes: ['name', 'id','email']})
    .then(function(matchedUser){
      console.log("Matched user: "+matchedUser);
      resolve(matchedUser);
    });
  }); //promise object
};//getUserFromID

exports.getMatches=function (userId){
  return new Promise(function(resolve){
   getMatchIds(userId).then(function(userIds){
     console.log("user ids of matched users"+userIds);
     var userRows=[];
     var actions = userIds.map(getUserFromId);
     var results = Promise.all(actions);
        results.then(function(data){
           resolve(data);
        });
     });
  }); //returned promise
}; //getMatches

exports.getProfile=function(userId){
  return new Promise(function(resolve){
    index.database.courseUserInfo.findOne({
      where: {uId: userId}
    }).then(profileInfo => {
      console.log("here info"+profileInfo);
      resolve(profileInfo);
    });
  });
};

exports.updateProfile=function(data){
  return new Promise(function(resolve){
    index.database.courseUserInfo.findOne({
      where: {uId: data.body.id}
    }).then(profile => {
      profile.updateAttributes({
        biography: data.body.biography,
        seeking: data.body.seeking,
        ambition: data.body.ambition
      });
      console.log("here info"+profile);
      resolve();
    });
  });
};

exports.findUserByEmail=function(email) {
  return new Promise(function(resolve) {
    index.database.users.findOne({
      where: {email: email}
    }).then(user => {
      resolve(user);
    });
  });
};

exports.createUser=function(username, email, password) {
  return new Promise(function(resolve) {
    index.database.users.findOrCreate({
      where: {name: username, email: email, password: password}
    }).then(function(newUser) {
      console.log("Added new user");
      console.log(newUser);
      index.database.courseUserInfo.findOrCreate({
        where: {uId: newUser[0].dataValues.id, cId: 1, ambition: "", seeking: "", biography: ""}
      }).then(function(res) {
        console.log("Added new courseUserinfo");
        resolve(newUser);
      });
    });
  });
};

exports.userLogin=function(email, password) {
  return new Promise(function(resolve){
    index.database.users.findOne({
      where: {email: email, password: password}
    }).then(user => {
      resolve(user);
    });
  });
};

exports.getMessageHistory=function(user1Id, user2Id) {
  return new Promise(function(resolve) {
    index.database.messages.findAll({
      where: {
        $or: [{from: user1Id, to: user2Id}, {from: user2Id, to: user1Id}]
      },
      order: [
        ['messageNumber', 'ASC']
      ]
    }).then(allMessages => {
      resolve(allMessages);
    });
  });
};

exports.saveNewMessage=function(user1Id, user2Id, message) {
  return new Promise(function(resolve) {
    index.database.matches.findOne({
      where: {
        $or: [{uId1: user1Id, uId2: user2Id}, {uId1: user2Id, uId2: user1Id}]
      }
    }).then(match => {
      match.increment('totalMessages');
      console.log("Updated totalMessages");

      index.database.messages.findOrCreate({
        where: {cId: 1, from: user1Id, to: user2Id, message: message,
           messageNumber: match.dataValues.totalMessages}
      }).then(function (res) {
        console.log("Message added");
        resolve(res);
      });
    });
  });
};

//gets the ids that have already been swiped: returns them inside an array [1,2,...3] <--- swiped ids
var getSwipedIds=exports.getSwipedIds=function(userId){
  return new Promise(function(resolve){
    index.database.userSwipes.findAll({
      where: {uid1:userId},
      raw: true
    }).then(function(results){
      var array=[];

      results.forEach(function(element) {
          array.push(element.uId2);
      });
      resolve(array);
    });
  });
};

//Returns all the swiped profiles.
var getSwipeProfiles=exports.getSwipeProfiles=function(userId){
  return new Promise(function(resolve){
    Promise.all([getMatchIds(userId),getSwipedIds(userId)]).then(function(results){
       var matchedIds=results[0];
       var swipedIds=results[1];
       var nonValidIds=swipedIds.concat(matchedIds);

       //make sure you can't swipe on yourself! duh!
       nonValidIds.push(userId);

       index.database.courseUserInfo.findAll({
         include: [
           {model: index.database.users,required:true}
         ],
         where: {uId: { $notIn: nonValidIds }}
       }).then(function(swipeProfiles){
         console.log(swipeProfiles);

         results=[];

         if (swipeProfiles.length<1){}

         else {
             swipeProfiles.forEach(function (elem) {
               var user = elem.user.dataValues;
               var course = elem.dataValues;

               results.push({
                 id: user.id,
                 name: user.name,
                 email: user.email,
                 cId: course.cId,
                 seeking: course.seeking,
                 ambition: course.ambition,
                 biography: course.biography
               });
             });
         }
         console.log("list of profiles that haven't been swiped:" +JSON.stringify(results[0]));

         //create a shuffle function that shuffles the swipe profiles before sending them back!
         var shuffle=function (array) {
             let counter = array.length;

             // While there are elements in the array
             while (counter > 0) {
                 // Pick a random index
                 let index = Math.floor(Math.random() * counter);

                 // Decrease counter by 1
                 counter--;

                 // And swap the last element with it
                 let temp = array[counter];
                 array[counter] = array[index];
                 array[index] = temp;
             }
             return array;
         };

         shuffle(results);

         resolve(results);
         }
       );
    });
  });
};

//adds an instance of a swipe in a given course if it doesn't exist
var addSwipe=exports.addSwipe=function(cId, userId1, userId2, liked){
  return new Promise(function(resolve) {
    index.database.userSwipes.findOrCreate({
      where: {uId1: userId1, uId2: userId2, cId: cId, liked: liked}
    }).then(resolve(result));
  });
};

var addMatch=exports.addMatch=function(cId, userId1, userId2){
  return new Promise(function(resolve) {
    index.database.matches.findOrCreate({
      where: {uId1: userId1, uId2: userId2, cId: cId, totalMessages: 0}
    }).then(resolve(result));
  });
};

//removes all instances of the swipe
var removeSwipe=exports.removeSwipe=function(cId,userId1,userId2,liked){
  return new Promise(function(resolve) {
    index.database.userSwipes.destroy({
      where: {uId1: userId1, uId2: userId2, cId: cId, liked: liked}
    }).then(function (res) {
      resolve(res);
    });
  });
}

//handles the case in which a user likes another user: checks to see if they both like eachother... etc.
var handleLike=exports.handleLike=function(cId,id1,id2){
  return new Promise(function(resolve){
    index.database.userSwipes.findOne({
      where: {
          $and:[
              {uId1: id2},
              {uId2: id1}
          ]
      }
    }).then(swipe => {
      console.log(swipe);
      var matched=false;

      //no previous entry. add this one.
      if(swipe === null){
        console.log("no prev entry: "+swipe);
        addSwipe(1,id1,id2,true);
        matched=false;
      }
      else if (swipe.liked == true){
        console.log("they like you!: "+swipe);
        removeSwipe(cId,id2,id1,1);
        addMatch(1,id1,id2);
        matched=true;
      }
      //user dislikes you and holds contempt for you in their heart of hearts </3
      else if (swipe.liked==false){
        //simply add your like to them
        console.log("they hate you!: "+swipe);
        addSwipe(1,id1,id2, true);
      }
      resolve(matched);
    });
  }); //promise
}//handleLike

var handleDislike=exports.handleDislike=function(cId,id1,id2){
  addSwipe(1,id1,id2,false);
}
