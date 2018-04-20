var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Session = require('./config/session').Session;
var Message = mongoose.model('ChatMessage');
var ChatRoom = mongoose.model('ChatRoom');
var User = mongoose.model('User');
var chatRoomController = require('./app/controllers/chatroom.controllers');

module.exports = function(socket){
  Session(socket.handshake, {}, function(err){
    if (err) {
      console.error(err);
      return;
    }
    var session = socket.handshake.session;

    chatRoomController.queryUserIdFromUsername(session.user.username).then(function(usr){
      chatRoomController.queryChatRoomListWithLatestMsg(session.user.chatRooms).then(function(chatrooms){
        for(let i=0;i<chatrooms.length;i++){
          console.log('client socket id = '+socket.id+' subscribed to room token = ' +chatrooms[i].token);
          socket.join(chatrooms[i].token);
        }
      });
    });

    //other actions for sockets

    socket.on('disconnect', function(){
      if(!session.user.chatRooms){
        session.user.chatRooms = [];
      }
      for(let i=0;i<session.user.chatRooms.length;i++){
        let roomID = session.user.chatRooms[i].roomID;
        ChatRoom.findById(roomID, function(err, room){
          if(err){
            console.log("err in disconnect");
            socket.emit('err', {
              msg: 'err in disconnect'
            });
          }
          else if(!room){
            console.log("cannot find room in disconnect");
            socket.emit('err', {
              msg: 'cannot find room in disconnect'
            });
          }
          else{
            console.log('client socket id = '+socket.id+' leaved room token = ' +room.token);
            socket.leave(room.token);
          }
        });
      }
    });

    socket.on('unsubscribe', (rooms) => {
      for(let i=0;i<rooms.length;i++){
        console.log('client socket id = '+socket.id+' leaved room token = ' +rooms[i].token);
        socket.leave(rooms[i]);
      }
    });

    socket.on('send', function(data){
      var msg = {};
      msg.sender = {};
      msg.content = data.content;
      chatRoomController.queryUserIdFromUsername(session.user.username)
      .then(function(user){
        msg.sender.id = user._id;
        msg.sender.username = user.username;
        msg.sender.name = session.user.name;
        ChatRoom.findOne( { token : data.room }, function(err, room){
          if(err || !room){
            console.log("err in send");
            socket.emit('err', {
              msg: 'err in send'
            });
          }
          else{
            msg.sender.roomID = room._id;
            var message = new Message(msg);
            message.save().then(function(m){
              socket.in(data.room).emit('new message', {
                content: m.content,
                createdTime: m.createdDate,
                messageID: m._id,
                room: data.room,
                sender: m.sender.name,
                username: m.sender.username,
              });
            }).catch(function(err){
              console.log("err in send");
              socket.emit('err', {
                msg: 'err in send'
              });
            });
          }
        });
      }).catch(function(err){
        console.error('Cannot Save Message ', err);
        socket.emit('err', {
          msg: 'cannot save message'
        });
      });
    });

    socket.on('read', function(data){
      data.messageID = ObjectId(data.messageID);
      ChatRoom.findOne({ token: data.room }, function(err, room){
        if(err){
          console.log("err in read");
          socket.emit('err', {
            msg: 'err in read'
          });
          return;
        }
        else if(!room){
          console.log("no room in read");
          socket.emit('err', {
            msg: 'no room in read'
          });
          return;
        }
        roomID = room._id;
        var ts = Date.now();
        User.findOneAndUpdate({ username: data.username, 'chatRooms.roomID': roomID }, {
          $set: {
            'chatRooms.lastSeenMessage': data.messageID,
            lastModified: ts
           }
        }, { new: true }, function(err, user){
            if(err){
              console.log("err in read");
              socket.emit('err', {
                msg: 'err in read'
              });
            }
            else if(!user){
              console.log("no user in read");
              socket.emit('err', {
                msg: 'no user in read'
              });
            }
            else{
              socket.emit('read ack', {
                timestamp: user.lastModified,
                messageID: data.messageID,
                roomToken: data.room,
              });
              socket.to(data.room).emit('seen', {
                timestamp: user.lastModified,
                messageID: data.messageID,
                username: user.username,
                nameOfUser: user.name,
                roomToken: data.room,
              });
            }
        });
      });
    });

    socket.on('join', function(data){
      var roomToken = data.roomToken;
      var user = session.user;
      ChatRoom.findOne({ token : roomToken }, function(err, room){
        if(err){
          console.log('err in join');
          socket.emit('err', {
            msg: 'err in join'
          });
        }
        else if(!room){
          console.log('no room in join');
          socket.emit('err', {
            msg: 'no room in join'
          });
        }
        else{
          var ts = Date.now();
          User.findOneAndUpdate({ username : user.username }, {
            $push : {
              chatRooms: {
                roomID: room._id,
                lastSeenMessage: null
              }
            },
            $set: {
              lastModified: ts
            }
          },{new: true}, function(err, updatedUser){
              if(err){
                console.log('err in join');
                socket.emit('err', {
                  msg: 'err in join'
                });
              }
              else if(!updatedUser){
                console.log('no user in join');
                socket.emit('err', {
                  msg: 'no user in join'
                });
              }
              else {
                socket.join(roomToken);
                socket.to(roomToken).emit('new join', {
                  username: updatedUser.username,
                  name: updatedUser.name,
                  timestamp: ts
                });
              }
          });
        }
      });
    });

    socket.on('leave', function(data){
      var roomToken = data.roomToken;
      var user = session.user;
      ChatRoom.findOne({ token: roomToken }, function(err, room){
        if(err){
          console.log('err in leave');
          socket.emit('err', {
            msg: 'err in leave'
          });
        }
        else if(!room){
          console.log('no room in leave');
          socket.emit('err', {
            msg: 'no room in leave'
          });
        }
        else{
          var ts = Date.now();
          User.findOneAndUpdate({ username: user.username }, {
            $pull: {
              chatRooms: { roomID: room._id }
            },
            $set: {
              lastModified: ts
            }
          }, {new: true}, function(err, updatedUser){
            if(err){
              console.log('err in leave');
              socket.emit('err', {
                msg: 'err in leave'
              });
            }
            else if(!updatedUser){
              console.log('no user in leave');
              socket.emit('err', {
                msg: 'no user in leave'
              });
            }
            else{
              socket.leave(roomToken);
              socket.to(roomToken).emit('member left', {
                username: user.username,
                name: user.name,
                timestamp: ts
              });
            }
          });
        }
      });
    });
  });
};
