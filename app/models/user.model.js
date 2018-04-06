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
	salt:{
			type: String,
			required: true,
			trim: true
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
	},
// authentication
	refresh_token: String,
	refresh_token_exp: Number,
});
// do this before save
userSchema.pre('save',function(next){
	if(this.password){
		this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
		this.password = this.hashPassword(this.password);
	}
	next();
});
// instance method
userSchema.methods.hashPassword = function(password){
	return crypto.pbkdf2Sync(password, this.salt, 10000, 64,'sha512').toString('base64');
}

userSchema.methods.authenticate = function(password){
	return this.password === this.hashPassword(password);
};
// find the unique username from different OAuth
userSchema.statics.findUniqueUsername = function(username, suffix, callback){
	var _this = this;
	var possibleUsername = username + (suffix || '');
	_this.findOne({
		username : possibleUsername
	}, function(err, user){
		if(!err){
			if(!user) callback(possibleUsername);
			else return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
		}
		else{
			callback(null);
		}
	});
};

mongoose.model('User',userSchema);
