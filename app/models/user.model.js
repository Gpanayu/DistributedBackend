var mongoose = require('mongoose');
var crypto = require('crypto');
var Moment = require('moment-timezone');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	name :{
		type:String,
		trim : true,
		unique : true,
		index:true,
		required:true,
		validate: [
			function(name){
				return /^(?:[aA-zZ]+| |-|[\u0E01-\u0E5B]+|[.])+$/.test(name);
			}, 'Name must consist of alphabets, whitespaces, periods or hyphens'
		]
	},
	username:{
		type:String,
		unique : true,
		trim : true,
		required: true,
		validate: [
			{
				validator : function(username){
					return username && username.length >=6 && username.length <= 20;
				}, msg : 'Username must be 6 - 20 characters long.'
			}
		]
	},
	password :{
		type:String,
		required: true
	},
	picture:{
		type:String,
		default:null
	},
	tokenDelete:{
		type:Boolean,
		default: false
	},
	created_date:{
		type: Date,
		default: Date.now
	},
	lastModified:{
		type: Date,
		default: Date.now
	},
	lastOnline:{
		type: Date,
		default: Date.now
	}
});

mongoose.model('User',userSchema);
