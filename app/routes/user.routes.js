var user = require('../controllers/user.controllers');

module.exports = function(app){

	app.post('/signup', user.signup);
	app.post('/login', user.login);
	app.post('/logout', user.logout);

	app.get('/validate-username', user.validateUsername);
	app.route('/user')
    .get(user.getProfile);

	if(process.env.NODE_ENV === "development"){
		//list of functions for debug only

	}

}
