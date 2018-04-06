process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express= require('./config/express');
var mongoose = require('./config/mongoose');
var passport = require('./config/passport');
var config = require('./config/config');


var db = mongoose();
var app = express();
var passport = passport();

var http = require('http');
var socketIO = require('socket.io');

const server = http.createServer(app);

const io = socketIO(server);

io.on('connection', socket => {
  console.log('User connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(config.PORT);

console.log("Server is running at " +config.IP +":"+config.PORT);
console.log("Server mode: "+process.env.NODE_ENV);
