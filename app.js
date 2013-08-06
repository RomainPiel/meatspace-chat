'use strict';

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var nconf = require('nconf');

nconf.argv().env().file({ file: 'local.json' });

/* Websocket setup */

var io = require('socket.io').listen(server);

io.configure(function () {
  io.set('transports', ['websocket', 'xhr-polling']);
  io.set('polling duration', 10);
  io.set('log level', 1);
});

io.sockets.on('connection', function (socket) {
  socket.on('join channel', function (channel) {
    socket.join(channel);
  });
/*
  socket.on('private', function (data) {
    io.sockets.in(data.channel).emit('private', data.privateChannel);
  });
*/

});

/* Filters for routes */

var isLoggedIn = function (req, res, next) {
  if (req.session.email) {
    next();
  } else {
    res.redirect('/');
  }
};

require('express-persona')(app, {
  audience: nconf.get('domain') + ':' + nconf.get('authPort')
});

// routes
require('./routes')(app, io, isLoggedIn);

server.listen(process.env.PORT || nconf.get('port'));
