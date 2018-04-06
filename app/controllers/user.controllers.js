var User = require('mongoose').model('User');
var config = require('../../config/config');
var passport = require('passport');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt')


exports.signup = function(req, res){
	if (!req.body.username || !req.body.password) {
    res.status(400).send({
      success: false,
      message: 'No username or password defined',
    });
  }
  const saltRounds = 10;
  bcrypt.hash(req.body.password, saltRounds).then((hash) => {
    const newUser = new User({
      username: req.body.username,
      password: hash,
			name: req.body.name
    });
    return newUser.save();
  }).then((user) => {
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
  }).catch((err) => {
    if (err.code === 11000) {
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
  }).then((usr) => {
    user = usr;
    return bcrypt.compare(req.body.password, user.password);
  }).then((result) => {
    if (result) {
      const {
        username,
				name
      } = user;
      req.session.user = {
        username: user.username,
				name: user.name
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
  }).catch((err) => {
    console.error(err);
    res.status(400).send({
      success: false,
      message: 'Invalid Password',
    });
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
	const findingUsername = req.query.username;
  User.count({
    username: findingUsername,
  }).then((count) => {
    if (count > 0) {
      res.status(200).json({
        available: false,
        username: findingUsername,
      });
    } else {
      res.status(200).json({
        available: true,
      });
    }
  }).catch((err) => {
    console.error(err);
    res.status(500).send({
      error: 'Internal Error',
    });
  });
};
