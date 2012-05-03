global.config = require('./lib/config');
//console.log("config : ", config);

//setup Dependencies
var connect = require('connect'),
    express = require('express'),
    io = require('socket.io'),
    mongoose = require('mongoose'),
    port = (process.env.PORT || config.server.port),
    host = (process.env.HOST || config.server.host),
    test = require('./lib/test.js');

//global.db = mongoose.connect(config.mongo.host);

//sick socket default :/
global.socket = {};
global.socket.on = function(type, data) {
    console.log(type, data);
};
global.socket.emit = function(type, data) {
    console.log(type, data);
};

//Setup Express
var server = express.createServer();
server.configure(function(){
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({ secret: "shhhhhhhhh!"}));
    server.use(connect.static(__dirname + '/assets'));
    server.use(server.router);
});

//setup the errors
server.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.jade', { locals: {
                  title : '404 - Not Found',
                  description: '',
                  author: '',
                  analyticssiteid: 'XXXXXXX'
                },status: 404 });
    } else {
        res.render('500.jade', { locals: {
                  title : 'The Server Encountered an Error',
                  description: '',
                  author: '',
                  analyticssiteid: 'XXXXXXX',
                  error: err
                },status: 500 });
    }
});
server.listen( port, host);

//Setup Socket.IO
var io = io.listen(server);
io.set('log level', 1);
global.io = io;
io.sockets.on('connection', function(socket){
    global.socket = socket;
  console.log('Client Connected');
  socket.on('message', function(data){
    socket.broadcast.emit('server_message',data);
    socket.emit('server_message',data);
    socket.emit('server_message',test.echo());
    socket.emit('server_message','ECHO TOTO');
  });
  socket.on('disconnect', function(){
    console.log('Client Disconnected.');
  });
});


//init lib modules
var redmine = require('./lib/redmine.js');
/*
 *var redmine = require('./lib/redmine.js'),
 *    mongo = require('./lib/mongo.js');
 */
/*
 *redmine.sync(null, function(){
 *    mongo.initObjects( null, function(){} );
 *});
 */

redmine.init();

//mongo.initObjects( null, function(){} );

var irc = require('./lib/irc.js');
irc.init();

///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function(req,res){
  io.sockets.on('connection', function(socket){
      global.push = true;
      global.socket = socket;
      socket.on('disconnect', function(){
          console.log('Client Disconnected.');
          global.push = false;
      });
  });
  res.render('index-' + config.clientFramework+ '.jade', {
    locals : {
              title : 'Your Page Title',
              description: 'Your Page Description',
              author: 'Your Name',
              analyticssiteid: 'XXXXXXX'
            }
  });
});

server.get('/demo', function(req,res){
  res.render('index_demo.jade', {
    locals : {
              title : 'Your Page Title',
              description: 'Your Page Description',
              author: 'Your Name',
              analyticssiteid: 'XXXXXXX'
            }
  });
});


//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on '+ host + ':' + port );
console.log('Using client framework ' + config.clientFramework );
