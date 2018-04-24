var session = require('express-session');
var MongoStore = require('connect-mongostore')(session);
var mongoose = require('mongoose');
var config = require('./config');

module.exports = {
  Session: session({
    secret: "thereIsNoSecretInTheWorld",
  	resave: false,
  	saveUninitialized: true,
    // store: new MongoStore({
    //   'db': mongoose.connection.db,
    //   'mongooseConnection': mongoose.connection
    // })
  })
};
