var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var chatRoomSchema = new Schema({
  name: String,
  token: {
    type: String,
    required: true,
    index: {
      unique: true,
    },
  },
  picture: {
    type: String,
    default: null
  },
  tokenDelete:{
		type: Boolean,
		default: false
	},
  createdDate:{
		type: Date,
		default: Date.now
	},
	lastModified:{
		type: Date,
		default: Date.now
	}
});

mongoose.model('ChatRoom', chatRoomSchema);
