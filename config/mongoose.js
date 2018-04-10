var mongoose = require('mongoose');
var Promise = require('bluebird');
var config = require('./config');

module.exports = function(){
	mongoose.set('debug',config.debug);			// mode
	mongoose.Promise = Promise;			// use Promise
	var db = mongoose.connect(config.mongoUri); // connect to database

	//import moment to mongoose : use in model
	require('mongoose-moment')(mongoose);

	// create collection
	require('../app/models/user.model');
	require('../app/models/chatroom.model');
	require('../app/models/message.model');
	return db; // database with setting
}
