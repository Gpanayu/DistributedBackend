var user = require('../controllers/user.controllers');
var passport = require('passport');

module.exports = function(app){

  // app.route('/user')
  //   .get(user.getProfile)
  //   .post(user.postProfile);

  //app.post('/user/logout',user.logout);

	if(process.env.NODE_ENV === "development"){
		//list of functions for debug only

	}

}
