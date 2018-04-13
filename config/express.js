var config = require('./config');
var express = require('express');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var multer = require('multer');
var cors = require('cors');
var validator = require('express-validator');
var flash = require('connect-flash');
var Session = require('./session').Session;

module.exports = function(){

	var app = express();

	app.use(Session);

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

 	app.use(flash());

  //setting up routing -------------------------------------
	require('../app/routes/user.routes')(app);
	require('../app/routes/chatroom.routes')(app);
	require('../app/routes/message.routes')(app);
	//end setting up routing -------------------------------------
 	app.use(express.static('./public'));


	return app;
}
