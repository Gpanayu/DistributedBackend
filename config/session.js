var session = require('express-session');

module.exports = {
  Session: session({
    secret: "thereIsNoSecretInTheWorld",
  	resave: false,
  	saveUninitialized: true
  })
};
