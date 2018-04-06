var User = require('mongoose').model('User');
var config = require('../../config/config');
var passport = require('passport');
var mongoose = require('mongoose');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var RefreshValidTime = require('../../config/config').refresh_valid_time;

exports.render = function(request, response){
	response.render('user-login',{
		title: 'Login EventHub',
		firstName: request.user ? request.user.firstName : '',
		message: request.flash('error')
	});
}

exports.revokeToken = function(request, response){
	const access_token = request.get("Authorization").split(" ")[1];
	const refresh_token = request.body.refresh_token;
	if(!access_token || !refresh_token){
		response.status(400).json({err:"no token provided"});
		return;
	}
	try{
		var decoded = jwt.verify(access_token,config.jwtSecret,{ignoreExpiration:true});
		if(decoded.exp*1000 + RefreshValidTime < new Date().getTime()){
			throw new Error("token expired");
		}
		console.log(decoded);
	}catch(err){
		console.error(err);
		if(err.msg === "token expired")
			response.status(400).json({err:"token expired"});
		else response.status(500).json({err:"Something went wrong"});
		return;
	}
	new Promise( (resolve,reject) => {
		User.findById(decoded.id,(err,user) => {
			if(err){
				console.error(new Date().toString());
				console.error(err);
				reject({code:500,err:"Internal error"});
			}
			else if(!user){
				console.error(new Date().toString());
				console.error("revoke token : user not found");
				reject({code:400,err:"Invalid Token"});
			}
			else if(user.refresh_token !== refresh_token){
				console.error(new Date().toString());
				console.error("revoke token : invalid refresh token");
				reject({code:400,err:"Invalid refresh token"});
			}
			else if(user.refresh_token_exp < new Date().getTime()){
				console.error(new Date().toString());
				console.error("revoke token fail : refresh token expired");
				let ret = {};
				ret.err = "refresh token expired";
				ret.expired = new Date(user.refresh_token_exp);
				reject({code:403,err:ret});
			}
			else resolve(user);
		});
	}).then( (user) => {
		return new Promise( (resolve,reject) => {
			user.generateToken( (err,rtoken) =>{
				if(err){
					resolve({code:500,err:"Internal Error"});
				}
				else{
					resolve({msg:"OK",access_token:rtoken.access_token});
				}
			});
		});
	}).catch( err => {
		console.error('error',err);
		return Promise.resolve(err);
	}).then( (payload) =>{
		if(payload.msg === "OK")
			code = 200;
		else code = _.get(payload,'code',500);
		payload = payload ? payload : {"err":"Internal Error"};
		delete payload.code;
		response.status(code).json(payload);
	});
}
