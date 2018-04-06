var config = require('./config');
var express = require('express');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var multer = require('multer');
var cors = require('cors');
var validator = require('express-validator');
var session = require('express-session');
var flash = require('connect-flash');

module.exports = function(){

	var app = express();

	app.use(session({
		secret: "thereIsNoSecretInTheWorld",
		resave: false,
		saveUninitialized: true
	}));

	// setting environment ---------------------------------------
	app.use(compression());
	app.use(morgan(':remote-addr :remote-user [:date[clf]] HTTP/:http-version" :method :url :status :res[content-length] - :response-time ms :user-agent'));

	app.use(bodyParser.urlencoded({
		limits: '5mb',
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(validator());
	app.use(cors());
	app.use(express.static('./public'));
 	// end setting environment ---------------------------------------

 	//set view engine ------------------------------------------------
 	//use at compile time path relative to server.js
 	// app.set('views','./app/views');
 	// app.set('view engine','jade');
 	// end set view engine -------------------------------------------

 	app.use(flash());


  //setting up routing -------------------------------------
	require('../app/routes/user.routes')(app);
	//end setting up routing -------------------------------------
 	app.use(express.static('./public'));


	return app;
}
