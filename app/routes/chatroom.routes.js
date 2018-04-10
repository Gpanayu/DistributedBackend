var chatroom = require('../controllers/chatroom.controllers');

module.exports = function(app){

	app.post('/newroom', chatroom.newRoom);
  app.get('/getallrooms', chatroom.getAllRooms);
  app.get('/getusersinroom', chatroom.getUsersInRoom);

	if(process.env.NODE_ENV === "development"){
		//list of functions for debug only

	}

}
