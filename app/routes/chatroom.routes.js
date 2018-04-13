var chatroom = require('../controllers/chatroom.controllers');

module.exports = function(app){

	app.post('/newroom', chatroom.newRoom);
  app.get('/getallrooms', chatroom.getAllRooms);
  app.get('/getusersinroom', chatroom.getUsersInRoom);

	if(process.env.NODE_ENV === "development"){
		//list of functions for debug only
		app.get('/testsocket', function(req, res){
				res.sendFile(__dirname + '/index.html');
		});
		app.get('/testlogin', function(req, res){
			res.sendFile(__dirname + '/testlogin.html');
		});
	}

}
