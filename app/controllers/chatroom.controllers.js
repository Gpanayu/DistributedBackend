var mongoose = require('mongoose');
var ChatRoom = mongoose.model('ChatRoom');
var User = mongoose.model('User');
var crypto = require('crypto');

exports.newRoom = function(req, res){
  if(!req.session.user){
		res.status(403).json({
			isLogin: false,
			message: "Not logged in"
		});
		return ;
	}
  else{
    var user = req.session.user;
    var joinUsers = req.body.join_users;
    joinUsers.push(user.username);
    var tmpSet = new Set(joinUsers);
    var joinUsers = [...tmpSet];
    queryUserIdFromUsernameList(joinUsers).then(function(users){
      randomToken(12)
      .then(function(buf){
        var chatRoom = new ChatRoom({
          name: req.body.name,
          token: buf.toString('hex')
        });
        chatRoom.save().then(function(room){
          addChatRoomToUserList(users, room._id)
          .then(function(){
            res.status(200).json({
              success: true,
              message: 'Create new chatroom succeeded',
              roomToken: room.token
            });
          })
          .catch(function(){
            res.status(500).send({
              success: false,
              error: 'Error in adding chatroom into users'
            });
          });
        }).catch(function(err){
          console.log("Fail to save chatroom");
          res.status(500).send({
            success: false,
            error: 'Fail to save chatroom'
          });
        });
      });
    }).catch(function(){
      res.status(500).send({
        success: false,
        error: 'Internal error'
      });
    });
  }
};

exports.getAllRooms = function(req, res){

};

exports.getUsersInRoom = function(req, res){

};

//======internal used functions========

var queryUserIdFromUsername = function(usrname){
  return new Promise(function(resolve, reject){
		User.findOne({'username' : usrname},function(err, user){
			if(err) {
				var info={};
				info.msg = 'Internal error in finding username';
				info.code = 500;
				reject(info);
			}
			else if(!user){
				var info={};
				info.msg = 'User not found';
				info.code = 404;
				reject(info);
			}
			else{
        var info = {};
        if(!user['tokenDelete']){
          info['_id'] = user['_id'];
          info['username'] = user['username'];
          resolve(info);
        }
        else{
          info.msg = 'User is deleted';
          info.code = 404;
          reject(info);
        }
			}
		});
	});
}

var queryUserIdFromUsernameList = function(arr){
  return new Promise(function(resolve, reject){
    var promises = [];
    var info = [];
    for(let i=0;i<arr.length;i++){
      promises.push(new Promise(function(resolve, reject){
        var index = i;
        queryUserIdFromUsername(arr[index])
        .then(function(user){
          info.push(user);
          resolve();
        })
        .catch(function(returnedInfo){
          reject();
        });
      }));
    }
    Promise.all(promises).then(function(){
      resolve(info);
    }).catch(function(){
      reject();
    });
  });
};

var addChatRoomToUserList = function(arr, roomID){
  return new Promise(function(resolve, reject){
    var promises = [];
    for(let i=0;i<arr.length;i++){
      promises.push(new Promise(function(resolve, reject){
        var index = i;
        addChatRoomToUser(arr[index], roomID)
        .then(function(){
          resolve();
        })
        .catch(function(){
          reject();
        });
      }));
    }
    Promise.all(promises).then(function(){
      resolve();
    }).catch(function(){
      reject();
    });
  });
};

var addChatRoomToUser = function(user, roomID){
  return User.findOneAndUpdate({'username' : user.username}, {
    $push: {
      chatRooms: {
        roomID,
        lastSeenMessage: null,
        isJoin: true,
        join: [].push(Date.now()),
        leave: [],
      }
    }
  },{ new: true });
};

var randomToken = function(size){
  return new Promise(function(resolve, reject){
    crypto.randomBytes(size, function(err, buf){
      if (err) return reject(err);
      return resolve(buf);
    });
  });
};
