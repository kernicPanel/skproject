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

//setup Dependencies
var connect = require('connect'),
    express = require('express'),
    http = require('http'),
    colors = require('colors'),
    mongoose = require('mongoose'),
    //mongoStore = require('connect-mongodb');
    RedisStore = require('connect-redis')(connect);

//mongoose.set('debug', true);

console.log();
console.log('App start'.red.inverse );

//var SessionMongoose = require("session-mongoose");

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
global.server = express();
global.httpServer = http.createServer(server);
server.config = require('./lib/config.js');
server.port = (process.env.VMC_APP_PORT || server.config.server.port);
server.host = (process.env.HOST || server.config.server.host);

if (!!process.env.VMC_APP_PORT) {
  server.host = null;
}
else {
  var replify = require('replify');
  replify(server.name, server);
  console.log("REPL".cyan.bold.inverse + " : netcat -U /tmp/repl/" + server.name + ".sock");
  console.log("  or".cyan.bold.inverse + " : socat - UNIX-CONNECT:/tmp/repl/" + server.name + ".sock");
  console.log("  or".cyan.bold.inverse + " : rc /tmp/repl/" + server.name + ".sock (npm install -g repl-client)");
  console.log();
}

server.name = server.config.server.name;
server.sessionSecret = "shshshshshss!"
server.cookieParser = express.cookieParser(server.sessionSecret);


console.log('VCAP_SERVICES', process.env.VCAP_SERVICES);

server.sessionStore = new RedisStore();

server.configure(function(){
    //server.use(express.logger());
    server.use(express.logger({ format: '\x1b[1m:method\x1b[0m \x1b[33m:url\x1b[0m :response-time ms' }));
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({
      secret: server.sessionSecret,
      //key: "express.sid",
      store: server.sessionStore
    }));
    server.use(express.methodOverride());
    server.use(connect.static(__dirname + '/assets'));
    server.use(server.router);
});

server.users = {};

//setup the errors
server.use(function(err, req, res, next){
  //console.error(err.stack);
  res.send(500, 'Something broke!');
});
httpServer.listen( server.port, server.host);

server.eventsManager = require('./lib/eventsManager.js');
server.eventsManager.init(server);

server.redmine = require('./lib/redmine.js');
server.redmine.init();

server.gitlab = require('./lib/gitlab.js');
server.gitlab.init();

server.redmineStats = require('./lib/redmineStats.js');
server.redmineStats.init();

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
 *  res.locals.login = req.session.login;
 *  next();
 *});
 */

/////// ADD ALL YOUR ROUTES HERE  /////////
server.addUser = function addUser ( login, callback ) {
  //console.log("server.users : ", server.users);
  if (!server.users[login]) {
    server.users[login] = {};
  }
  server.redmine.connectUser( login, function(err, data){
    console.log(server.users);
    //res.redirect('/');
    callback(err, data);
  });
}

/** Middleware for limited access */
function requireLogin (req, res, next) {
  if (req.session.login) {
    // User is authenticated, let him in
    //server.addUser( req.session.login, function( err, data ){
      next();
    //});
  } else {
    // Otherwise, we redirect him to login form
    res.redirect("/login");
  }
}

/** Login form */
server.get("/login", function (req, res) {
    addLocals( null, function( err, locals) {
      console.log("locals : ", locals);
      locals.error = null;
      locals.login = '';
      locals.title = 'Login | ' + locals.title;
      res.render('login.jade', locals);
    });
});

server.post("/login", function (req, res) {
  var login = req.body.login;
  server.redmine.login(req.body, function(err, isAuth) {
    if (!isAuth) {
      addLocals( null, function( err, locals) {
        locals.error = "Wrong login or password";
        locals.login = login;
        locals.title = 'Login | ' + locals.title;
        res.render('login.jade', locals);
      });
    }
    else {
      req.session.login = req.body.login;
      server.addUser( req.body.login, function( err, data ){
        res.redirect('/');
      });
      /*
       *req.session.login = req.body.login;
       *server.users[req.session.login] = {};
       *server.redmine.connectUser( req.session.login, function(err, data){
       *  res.redirect('/');
       *});
       */
    }
  });
});


server.get('/logout', function (req, res) {
  server.redmine.disconnectUser( req.session.login, function(err, data){
    delete server.users[req.session.login];
    req.session.login = null;
  });
  res.redirect('/');
});

server.post("/redmine-key", function (req, res) {
  server.redmine.getUserFromKey(req.body.key, function(err, data) {
    if (err) {
      addLocals( null, function( err, locals) {
        locals.error = "Api Key doesn't exists";
        locals.login = '';
        locals.title = 'Login | ' + locals.title;
        res.render('login.jade', locals);
      });
    }
    else if (!data) {
      addLocals( null, function( err, locals) {
        locals.error = "Api Key already registered";
        locals.login = '';
        locals.title = 'Login | ' + locals.title;
        res.render('login.jade', locals);
      });
    }
    else {
      var user = data.user;
      addLocals( null, function( err, locals) {
        //locals.login = '';
        //locals.title = 'Login | ' + locals.title;

          locals.title = 'Create user | ' + locals.title;
          locals.error = null;
          locals.login =  user.mail.split('@')[0];
          locals.firstname =  user.firstname;
          locals.lastname =  user.lastname;
          locals.apiKey = req.body.key;
          locals.last_login_on = user.last_login_on;
          locals.created_on = user.created_on;
          locals.mail = user.mail;
          locals.id = user.id;
        res.render('create-user.jade', locals);
      });
    }
  });
});

server.post("/create-user", function (req, res) {
  var login = req.body.login;
  var password = req.body.password;
  var confirmPassword = req.body.confirmPassword;
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var last_login_on = req.body.last_login_on;
  var created_on = req.body.created_on;
  var mail = req.body.mail;
  var irc = req.body.irc;
  var id = req.body.id;

  if (password !== confirmPassword) {
    addLocals( req.body, function( err, locals) {
      locals.error = "passwords must match";
      locals.title = 'Create user | ' + locals.title;
      res.render('create-user.jade', locals);
    });
  }
  else {
    delete req.body.confirmPassword;
    server.redmine.createUser(req.body, function(err, user){
      server.redmine.login(req.body, function(err, isAuth) {
        if (!isAuth) {
          addLocals( null, function( err, locals) {
            locals.error = "Wrong login or password";
            locals.login = login;
            locals.title = 'Login | ' + locals.title;
            res.render('login.jade', locals);
          });
        }
        else {
          req.session.login = req.body.login;
          server.addUser( req.body.login, function( err, data ){
            res.redirect('/');
          });
        }
      /*
       *addLocals( null, function( err, locals) {
       *  locals.error = null;
       *  locals.login = login;
       *  locals.title = 'Login | ' + locals.title;
       *  res.render('login.jade', locals);
       *});
       */
      });
    });
  }
});

server.post("/update-user", function (req, res) {
  server.redmine.updateUser(req.session.login, req.body, function(err, user){
    res.redirect('/account');
  });
});

server.post("/update-user-password", function (req, res) {
  res.redirect('/account');
});


server.get('/extract', [requireLogin], function(req,res){
  res.render('extract.jade',  {
      title : server.host + ':' + server.port + ' | skProject | ' + server.config.clientFramework ,
      description: 'Your Page Description',
      author: 'Your Name',
      analyticssiteid: 'XXXXXXX'
    });
});

server.get('/stats', [requireLogin], function(req,res){
  var requestLogin = req.session.login;
  addLocals( null, function( err, locals ) {
    locals.error = null;
    locals.login = req.session.login;
    locals.title = 'Team | ' + locals.title;
    locals.admin = server.config.server.admin.indexOf(requestLogin) > -1;
    res.render('stats.jade', locals);
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
  server.redmine.getUserByLogin(req.session.login, function(err, data){
    if (data) {
      addLocals( data, function() {
        data.error = null;
        data.login = req.session.login;
        data.title = 'Account | ' + data.title;
        data.admin = true;
      console.log('data!!!', data);
        res.render('account.jade', data);
      });
    }
  });
});

server.get("/account-password", [requireLogin], function (req, res) {
  server.redmine.getUserByLogin(req.session.login, function(err, data){
    if (data) {
      addLocals( data, function() {
        data.error = null;
        data.login = req.session.login;
        data.title = 'Account | ' + data.title;
        data.admin = true;
      console.log('data!!!', data);
        res.render('password.jade', data);
      });
    }
  });
});

server.get('/', [requireLogin], function(req,res){
  res.sendfile('assets/indexEmber.html');
  /*
   *var requestLogin = req.session.login;
   *addLocals( null, function( err, locals ) {
   *  locals.error = null;
   *  locals.login = req.session.login;
   *  locals.title = 'Team | ' + locals.title;
   *  locals.admin = server.config.server.admin.indexOf(requestLogin) > -1;
   *  res.render('team-' + server.config.clientFramework + '.jade', {
   *    locals : locals
   *  });
   *});
   */
});


server.get('/users/:id', [requireLogin], function(req,res){
  server.redmine.getUser(req.params.id, function(err, data){
    res.send({user: data});
  });
});

server.get('/users', [requireLogin], function(req,res){
  server.redmine.getUsers(function(err, users){
    res.send({ users: users });
    /*
     *server.redmine.getIssues(false, function(err, issues){
     *  res.send({
     *    users: users,
     *    issues: issues
     *  });
     *});
     */
  });
});

server.get('/issues?:ids', [requireLogin], function(req,res){
  server.redmine.getIssues(req.query.ids, function(err, data){
    res.send({issues: data});
  });
});

server.get('/issues', [requireLogin], function(req,res){
  server.redmine.getIssues(false, function(err, data){
    res.send({issues: data});
  });
});

server.get('/issues/:id', [requireLogin], function(req,res){
  server.redmine.getIssue(req.params.id, function(err, data){
    res.send({issue: data});
  });
});

server.get('/projects?:ids', [requireLogin], function(req,res){
  server.redmine.getProjects(req.query.ids, function(err, data){
    res.send({projects: data});
  });
});

server.get('/projects', [requireLogin], function(req,res){
  server.redmine.getProjects(false, function(err, data){
    res.send({projects: data});
  });
});

server.get('/projects/:id', [requireLogin], function(req,res){
  server.redmine.getProject(req.params.id, function(err, data){
    res.send({project: data});
  });
});

server.get('/statsProject/:id', [requireLogin], function(req,res){
  server.redmine.getStatsProject(req.params.id, function(err, stats){
    res.send(stats);
  });
});

server.get('/statsUser/:type/:ids?', [requireLogin], function(req,res){
  server.redmine.getStatsIssuesByType(req.query.ids, req.params.type, function(err, stats){
    res.send(stats);
  });
});

server.get('/statsUser/:ids?', [requireLogin], function(req,res){
  server.redmine.getAllStatsIssues(req.query.ids, function(err, stats){
    res.send(stats);
  });
});

server.get('/priorities/:id', [requireLogin], function(req,res){
  server.redmine.getPriority(req.params.id, function(err, data){
    res.send({priorities: data});
  });
});

server.get('/statuses/:id', [requireLogin], function(req,res){
  server.redmine.getStatus(req.params.id, function(err, data){
    res.send({statuses: data});
  });
});

server.get('/currentuser/', [requireLogin], function(req,res){
  //var requestLogin = { login: req.session.login };
  //console.log("req.session : ", req.session);
  //console.log("requestLogin : ", requestLogin);
  server.redmine.getUserByLogin(req.session.login, function(err, data){
    //res.send({currentuser: data});
    res.send(data);
  });
});

server.get('/admin', [requireLogin], function(req,res){
  var requestLogin = req.session.login;
  console.log('requestLogin', requestLogin);
  console.log('server.config.server.admin', server.config.server.admin);
  console.log(server.config.server.admin.indexOf(requestLogin > -1));
  if (server.config.server.admin.indexOf(requestLogin) > -1) {
    addLocals( null, function( err, locals) {
      locals.error = "Wrong login or password";
      locals.login = requestLogin;
      locals.title = 'Admin | ' + locals.title;
      locals.admin = true;
      res.render('admin.jade', locals);
    });
    // res.send({
    //   pid: process.pid,
    //   memory: process.memoryUsage(),
    //   uptime: process.uptime(),
    //   connections: server.connections
    // });
  }
  else {
    res.redirect('/');
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
server.use(function(req, res, next){
  res.send(404, 'Sorry cant find that!');
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
