process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express= require('./config/express');
var mongoose = require('./config/mongoose');
var config = require('./config/config');


var db = mongoose();
var app = express();

var http = require('http');
var socketIO = require('socket.io');

const server = http.createServer(app);

const io = socketIO(server);
const ioConnect = require('./io-connect');

var Session = require('./config/session').Session;

io.set('authorization', function(handshake, callback){
  Session(handshake, {}, function(err){
    if(err){
      console.log("socket auto err");
      return callback(err);
    }
    else{
      if(!handshake.session.user){
        console.log("socket auto false");
        callback(null, false);
      }
      else{
        console.log("socket auto true");
        callback(null, true);
      }
    }
  });
});

io.on('connection', ioConnect);
// io.on('connection', function(socket){
//   console.log("dis sys spartaa");
// });

server.listen(config.PORT);

console.log("Server is running at " +config.IP +":"+config.PORT);
console.log("Server mode: "+process.env.NODE_ENV);
