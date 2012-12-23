/*

Copyright (c) 2012 Nicolas Clerc <kernicpanel@nclerc.fr>

This file is part of realTeam.

realTeam is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

realTeam is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with realTeam.  If not, see <http://www.gnu.org/licenses/>.

*/

//require('look').start();
var replify = require('replify');
// var winston = require('winston');

//setup Dependencies
var connect = require('connect'),
    express = require('express'),
    colors = require('colors'),
    mongoose = require('mongoose'),
    mongoStore = require('connect-mongodb');

console.log();
console.log('App start'.red.inverse );
// winston.log('info', 'test winston');

var SessionMongoose = require("session-mongoose");

console.dir = require('cdir');

colors.setTheme({
    silly: 'rainbow',
    input: 'black',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

//Setup Express
global.server = express.createServer();
server.config = require('./lib/config.js');
server.port = (process.env.PORT || server.config.server.port);
server.host = (process.env.HOST || server.config.server.host);
server.name = server.config.server.name;

replify(server.name, server);
console.log("REPL".cyan.bold.inverse + " : netcat -U /tmp/repl/" + server.name + ".sock");
console.log("  or".cyan.bold.inverse + " : socat - UNIX-CONNECT:/tmp/repl/" + server.name + ".sock");
console.log("  or".cyan.bold.inverse + " : rc /tmp/repl/" + server.name + ".sock (npm install -g repl-client)");
console.log();

server.sessionStore = new SessionMongoose({
  url: server.config.mongo.session,
  interval: 120000 // expiration check worker run interval in millisec (default: 60000)
});

server.configure(function(){
    //server.use(express.logger());
    server.use(express.logger({ format: '\x1b[1m:method\x1b[0m \x1b[33m:url\x1b[0m :response-time ms' }));
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({
      secret: "shhhhhhhhh!",
      key: "express.sid",
      store: server.sessionStore
    }));
    server.use(express.methodOverride());
    server.use(connect.static(__dirname + '/assets'));
    server.use(server.router);
});

server.users = {};

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
server.listen( server.port, server.host);

server.eventsManager = require('./lib/eventsManager.js');
server.eventsManager.init(server);

server.redmine = require('./lib/redmine.js');
server.redmine.init();

server.redmineExtract = require('./lib/redmineExtract.js');
server.redmineExtract.init();

server.irc = require('./lib/irc.js');
server.irc.init();

server.timer = require('./lib/timer.js');
server.timer.init();

var commonLocals = {
  title: server.name + ' | ' + server.config.clientFramework + ' | ' + server.host + ':' + server.port,
  description: 'Realtime Redmine client',
  author: 'Nicolas Clerc',
  analyticssiteid: 'XXXXXXX'
};

var addLocals = function( newLocals, callback ) {
  newLocals = newLocals || {};
  for (var key in commonLocals) {
    newLocals[key] = commonLocals[key];
  }
  callback(null, newLocals);
};

///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/*
 *server.use(function(req, res, next){
 *  res.locals.title = server.host + ':' + server.port + ' | skProject | ' + server.config.clientFramework;
 *  res.locals.description = 'Your Page Description';
 *  res.locals.author = 'Your Name';
 *  res.locals.analyticssiteid = 'XXXXXXX';
 *  res.locals.username = req.session.username;
 *  next();
 *});
 */

/////// ADD ALL YOUR ROUTES HERE  /////////
server.addUser = function addUser ( username, callback ) {
  //console.log("server.users : ", server.users);
  if (!server.users[username]) {
    server.users[username] = {};
  }
  server.redmine.connectUser( username, function(err, data){
    //res.redirect('/');
    callback(err, data);
  });
}

/** Middleware for limited access */
function requireLogin (req, res, next) {
  if (req.session.username) {
    // User is authenticated, let him in
    server.addUser( req.session.username, function( err, data ){
      next();
    });
  } else {
    // Otherwise, we redirect him to login form
    res.redirect("/login");
  }
}

/** Login form */
server.get("/login", function (req, res) {
    addLocals( null, function( err, locals) {
      locals.error = null;
      locals.username = '';
      locals.title = 'Login | ' + locals.title;
      res.render('login.jade', {
        locals : locals
      });
    });
});

server.post("/login", function (req, res) {
  var username = req.body.username;
  server.redmine.login(req.body, function(err, isAuth) {
    if (!isAuth) {
      addLocals( null, function( err, locals) {
        locals.error = "Wrong login or password";
        locals.username = username;
        locals.title = 'Login | ' + locals.title;
        res.render('login.jade', {
          locals : locals
        });
      });
    }
    else {
      req.session.username = req.body.username;
      server.addUser( req.body.username, function( err, data ){
        res.redirect('/');
      });
      /*
       *req.session.username = req.body.username;
       *server.users[req.session.username] = {};
       *server.redmine.connectUser( req.session.username, function(err, data){
       *  res.redirect('/');
       *});
       */
    }
  });
});


server.get('/logout', function (req, res) {
  server.redmine.disconnectUser( req.session.username, function(err, data){
    delete server.users[req.session.username];
    req.session.username = null;
  });
  res.redirect('/');
});

server.post("/redmine-key", function (req, res) {
  server.redmine.getUserFromKey(req.body.key, function(err, data) {
    if (err) {
      addLocals( null, function( err, locals) {
        locals.error = "Api Key doesn't exists";
        locals.username = '';
        locals.title = 'Login | ' + locals.title;
        res.render('login.jade', {
          locals : locals
        });
      });
    }
    else if (!data) {
      addLocals( null, function( err, locals) {
        locals.error = "Api Key already registered";
        locals.username = '';
        locals.title = 'Login | ' + locals.title;
        res.render('login.jade', {
          locals : locals
        });
      });
    }
    else {
      var user = data.user;
      res.render('create-user.jade', {
        locals : {
          error: null,
          username:  user.mail.split('@')[0],
          firstname:  user.firstname,
          lastname:  user.lastname,
          apiKey: req.body.key,
          last_login_on: user.last_login_on,
          created_on: user.created_on,
          mail: user.mail,
          id: user.id
        }
      });
    }
  });
});

server.post("/create-user", function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var confirmPassword = req.body.confirmPassword;
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var last_login_on = req.body.last_login_on;
  var created_on = req.body.created_on;
  var mail = req.body.mail;
  var id = req.body.id;

  if (password !== confirmPassword) {
    addLocals( req.body, function( err, locals) {
      locals.error = "passwords must match";
      locals.title = 'Create user | ' + locals.title;
      res.render('create-user.jade', {
        locals : locals
      });
    });
  }
  else {
    delete req.body.confirmPassword;
    server.redmine.createUser(req.body);
    addLocals( null, function( err, locals) {
      locals.error = null;
      locals.username = username;
      locals.title = 'Login | ' + locals.title;
      res.render('login.jade', {
        locals : locals
      });
    });
  }
});

server.get('/extract', [requireLogin], function(req,res){
  res.render('extract.jade', {
    locals : {
      title : server.host + ':' + server.port + ' | skProject | ' + server.config.clientFramework ,
      description: 'Your Page Description',
      author: 'Your Name',
      analyticssiteid: 'XXXXXXX'
    }
  });
});

server.get('/stats', [requireLogin], function(req,res){
  var requestLogin = req.session.username;
  addLocals( null, function( err, locals ) {
    locals.error = null;
    locals.username = req.session.username;
    locals.title = 'Team | ' + locals.title;
    locals.admin = server.config.server.admin.indexOf(requestLogin) > -1;
    res.render('stats.jade', {
      locals : locals
    });
  });
  // res.render('stats.jade', {
  //   locals : {
  //     title : server.host + ':' + server.port + ' | skProject | ' + server.config.clientFramework ,
  //     description: 'Your Page Description',
  //     author: 'Your Name',
  //     analyticssiteid: 'XXXXXXX'
  //   }
  // });
});

server.get("/account", [requireLogin], function (req, res) {
  var requestLogin = { username: req.session.username };
  server.redmine.getAppUser(requestLogin, function(err, data) {
    if (data) {
      addLocals( data, function() {
        data.error = null;
        data.username = req.session.username;
        data.title = 'Account | ' + data.title;
        data.admin = true;
      console.log('data!!!', data);
        res.render('account.jade', {
          locals : data
        });
      });
    }
  });
});

server.get('/team', [requireLogin], function(req,res){
  var requestLogin = req.session.username;
  addLocals( null, function( err, locals ) {
    locals.error = null;
    locals.username = req.session.username;
    locals.title = 'Team | ' + locals.title;
    locals.admin = server.config.server.admin.indexOf(requestLogin) > -1;
    res.render('team-' + server.config.clientFramework+ '.jade', {
      locals : locals
    });
  });
});

server.get('/admin', [requireLogin], function(req,res){
  var requestLogin = req.session.username;
  console.log('requestLogin', requestLogin);
  console.log('server.config.server.admin', server.config.server.admin);
  console.log(server.config.server.admin.indexOf(requestLogin > -1));
  if (server.config.server.admin.indexOf(requestLogin) > -1) {
    addLocals( null, function( err, locals) {
      locals.error = "Wrong login or password";
      locals.username = requestLogin;
      locals.title = 'Admin | ' + locals.title;
      locals.admin = true;
      res.render('admin.jade', {
        locals : locals
      });
    });
    // res.send({
    //   pid: process.pid,
    //   memory: process.memoryUsage(),
    //   uptime: process.uptime(),
    //   connections: server.connections
    // });
  }
  else {
    res.redirect('/team');
  }

});

server.get('/', [requireLogin], function(req,res){
  res.redirect('/team');
});

server.get('/log', [requireLogin], function(req,res){
  console.log('req', req);
  server.eventsManager.emit('broadLog', req.query);
  server.eventsManager.emit('broadLog', req.body);
  res.send({
    query: req.query,
    body: req.body
  });
});

server.get('/health', function(req, res){
  res.send({
    pid: process.pid,
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    connections: server.connections
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

console.log();
console.log('Listening on '.info + (server.host + ':' + server.port).inverse.info );
console.log(('Using client framework ' + server.config.clientFramework).info );
console.log();
