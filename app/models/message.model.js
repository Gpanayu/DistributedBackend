var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var chatMessageSchema = new Schema({
  content: String,
  sender: {
    id: Schema.Types.ObjectId,
    username: String,
    name: String
  },
  roomID: Schema.Types.ObjectId,
  createdDate:{
		type: Date,
		default: Date.now
	}
});

mongoose.model('ChatMessage', chatMessageSchema);
