  /* jslint node: true */
"use strict";

var model = require('./model.js');

module.exports = function (socket, io) {

  //user swipes left: dislike on another user
  socket.on('dislike', function (req) {
    console.log("SOCKET EVENT DISLIKE RECEIVED");
    var user1 = req.uId1;
    var user2 = req.uId2;

    //by default we add to course 1: intnet
    model.handleDislike(1, user1, user2 , 0);
  });

  socket.on('joinMatches',function(req){
    var id=req.id;
    console.log("server: user"+ req.id+"joined matches subscription.");
    socket.join("matches-"+id);
  });

  socket.on('joinSwipe',function(req){
    var id=req.id;
    console.log("server: user"+ req.id+"joined swipe subscription.");
    socket.join("swipe-"+id);
  });

  //user swipes right: like on another user
  socket.on('like', function (req) {
    console.log("SOCKET EVENT LIKE RECEIVED");
    var user1 = req.uId1;
    var user2 = req.uId2;

    //by default we are checking through course 1: intnet.
    model.handleLike(1, user1, user2).then(function(matched){
      console.log("matched? " + matched);
      if (matched===true) {
        io.to("matches-"+user2).emit('updateMatches', req);
        io.to("swipe-"+user1).emit('showMatchedMessage');
        console.log("SENT REQUEST TO UPDATE MATCHES+SHOW MESSAGE!");
      }
    });
  });

  socket.on('updateChatRoom', function(req) {
    var user1Id = req.user1Id;
    var user2Id = req.user2Id;

    let chatRoomName = "";
    if(Math.max(user1Id, user2Id) === user2Id) {
      chatRoomName = user1Id + "-" + user2Id;
    } else {
      chatRoomName = user2Id + "-" + user1Id;
    }

    console.log("ChatRoom to update: " + chatRoomName);

    model.saveNewMessage(user1Id, user2Id, req.message).then(function(update) {
      io.to(chatRoomName).emit('updateChatRoom', req);
    });
  });

  socket.on('joinChatRoom', function(req) {

    var user1Id = req.user1Id;
    var user2Id = req.user2Id;

    let chatRoomName = "";
    if(Math.max(user1Id, user2Id) === user2Id) {
      chatRoomName = user1Id + "-" + user2Id;
    } else {
      chatRoomName = user2Id + "-" + user1Id;
    }

    socket.join(chatRoomName);
    console.log('A user joined ' + chatRoomName);
  });
};
