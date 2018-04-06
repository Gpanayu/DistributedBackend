var user = require('../controllers/user.controllers');
var passport = require('passport');

module.exports = function(app){

  // app.route('/user')
  //   .get(user.getProfile)
  //   .post(user.postProfile);


	app.post('/signup', user.signup);
	app.post('/login', user.login);
	app.post('/logout', user.logout);

	app.get('/validate-username', user.validateUsername);

	if(process.env.NODE_ENV === "development"){
		//list of functions for debug only

	}

}
