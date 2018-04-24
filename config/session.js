var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var config = require('./config');

module.exports = {
  Session: session({
    secret: "thereIsNoSecretInTheWorld",
  	resave: false,
  	saveUninitialized: true,
    store: new MongoStore({
      url: 'mongodb://localhost/dissys'
    })
  })
};
