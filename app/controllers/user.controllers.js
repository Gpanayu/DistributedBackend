var User = require('mongoose').model('User');
var config = require('../../config/config');
var passport = require('passport');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt')

exports.login = function(req, res){
	if (!req.body.username || !req.body.password) {
    res.status(400).send({
      success: false,
      message: 'No username or password defined',
    });
  }
  let user = null;
  User.findOne({
    username: req.body.username,
  }).then(function(usr){
    user = usr;
    return bcrypt.compare(req.body.password, user.password);
  }).then(function(result){
    if (result) {
      const {
        username,
				name
      } = user;
      req.session.user = {
        username: user.username,
				name: user.name,
				chatRooms: user.chatRooms,
				picture: user.picture
      };
      res.status(200).json({
        success: true,
        user: {
          username,
					name
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid Password',
      });
    }
  }).catch(function(err){
    console.error(err);
    res.status(400).send({
      success: false,
      message: 'Invalid Password',
    });
  });
};

exports.signup = function(req, res){
	if (!req.body.username || !req.body.password) {
    res.status(400).send({
      success: false,
      message: 'No username or password defined',
    });
  }
  const saltRounds = 10;
  bcrypt.hash(req.body.password, saltRounds).then(function(hash){
    const newUser = new User({
      username: req.body.username,
      password: hash,
			name: req.body.name
    });
    return newUser.save();
  }).then(function(user){
    console.log('Successfully create new user');
    req.session.user = {
      username: user.username,
			name: user.name
    };
    res.status(200).send({
      success: true,
      message: 'Successfully register user.',
      username: user.username,
			name: user.name
    });
  }).catch(function(err){
    if (err.code == 11000) {
      res.status(400).send({
        success: false,
        message: 'This username already exists',
      });
    } else {
      console.error(err);
      res.status(400).send({
        success: false,
        message: 'Cannot create new user',
      });
    }
  });
};

exports.logout = function(req, res){
	req.session.destroy();
  res.status(200).json({
    success: true,
    message: 'Successfully Log Out',
  });
};

exports.validateUsername = function(req, res){
  User.count({
    username: req.query.username,
  }).then(function(count){
    if (count > 0) {
      res.status(200).json({
        available: false,
        username: req.query.username,
      });
    } else {
      res.status(200).json({
        available: true,
      });
    }
  }).catch(function(err){
    console.error(err);
    res.status(500).send({
      error: 'Internal Error',
    });
  });
};

exports.getProfile = function(req, res){
	if(!req.session.user){
		res.status(403).json({
			isLogin: false,
			message: "Not logged in"
		});
		return ;
	}
	else{
		var user = req.session.user;
		User.findOne({
			username: user.username
		}).then(function(usr){
			if(!usr){
				res.status(404).send({
					success: false,
					error: "Cannot find user"
				});
				return ;
			}
			else{
				var fields = ["username", "name", "lastOnline", "chatRooms",
				"lastModified", "created_date", "tokenDelete", "picture"];
				var usr2 = {};
				for(let i=0;i<fields.length; i++){
					usr2[fields[i]] = usr[fields[i]];
					if(i == fields.length-1){
						res.status(200).json({
							success: true,
							message: "Successfully find user",
							user: usr2
						});
					}
				}
			}
		}).catch(function(err){
			console.log(err);
			res.status(500).send({
				success: false,
				error: "Internal Error"
			});
		});
	}
};
