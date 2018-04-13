var message = require('../controllers/message.controllers');

module.exports = function(app){

  app.get('/message', message.getMessages);

	if(process.env.NODE_ENV === "development"){
		//list of functions for debug only

	}

}
