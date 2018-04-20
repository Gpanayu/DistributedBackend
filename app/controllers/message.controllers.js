var Message = require('mongoose').model('ChatMessage');
var ChatRoom = require('mongoose').model('ChatRoom');
var User = require('mongoose').model('User');

exports.getMessages = function(req, res){
  if(!req.session.user){
		res.status(403).json({
			isLogin: false,
			message: "Not logged in"
		});
		return ;
	}
  else{
    var user = req.session.user;
    var roomToken = req.query.roomToken;
    User.findOne({ username: user.username }, function(err, usr){
      if(err){
        console.log('err in getMessages');
      }
      else{
        ChatRoom.findOne({ token : roomToken }, function(err, room){
          if(err){
            res.status(err.code).json({
              success: false,
              message: err.msg
            });
            return;
          }
          else if (!room){
            res.status(404).json({
              success: false,
              message: 'Cannot find room'
            });
          }
          else{
            var lastSeenMessage = null;
            var flag = false;
            if(!usr.chatRooms){
              usr.chatRooms = [];
            }
            for(let i=0;i<usr.chatRooms.length;i++){
              console.log("room._id = " +room._id );
              console.log("usr.chatRooms[i].roomID = "+usr.chatRooms[i].roomID);
              if(room._id.equals(usr.chatRooms[i].roomID)){
                  lastSeenMessage = usr.chatRooms[i].lastSeenMessage;
                  flag = true;
              }
            }
            Message.find({ roomID: room._id }).sort({ createdDate: 'ascending' })
            .then(function(msgs){
              if(!lastSeenMessage && !flag){
                res.status(403).json({
                  success: false,
                  message: 'Data not available'
                });
              }
              else{
                res.status(200).json({
                  success: true,
                  messages: msgs,
                  lastSeenMessage: lastSeenMessage
                });
              }
            }).catch(function(err){
              console.log(err);
              res.status(500).json({
                success: false,
                message: 'Internal error'
              });
            });
          }
        });
      }
    });
  }
};
