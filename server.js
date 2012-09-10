
//setup Dependencies
var connect = require('connect'),
    express = require('express'),
    colors = require('colors'),
    mongoose = require('mongoose'),
    mongoStore = require('connect-mongodb');

console.log('App start'.red.inverse );

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

var mongooseSessionStore = new SessionMongoose({
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
      store: mongooseSessionStore
    }));
    /*
     *server.use(express.session({
     *    // Private crypting key
     *    "secret": "some private string",
     *    // Internal session data storage engine, this is the default engine embedded with connect.
     *    // Much more can be found as external modules (Redis, Mongo, Mysql, file...). look at "npm search connect session store"
     *    //"store":  new express.session.MemoryStore({ reapInterval: 60000 * 10 })
     *    //"store":  mongoStore(server.config.mongo.host)
     *}));
     */
    server.use(express.methodOverride());
    server.use(connect.static(__dirname + '/assets'));
    server.use(server.router);
});

server.users = {};
/*
 *var db = mongoose.connect(server.config.mongo.host);
 *
 *function mongoStoreConnectionArgs() {
 *  return { dbname: db.databaseName,
 *           host: db.host,
 *           port: db.port,
 *           username: db.username,
 *           password: db.password };
 *}
 *
 *server.use(express.session({
 *  "secret": "some private string",
 *  store: mongoStore(mongoStoreConnectionArgs())
 *}));
 */


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

//server.irc = require('./lib/irc.js');
//server.irc.init();

var commonLocals = {
  title: 'skProject | ' + server.config.clientFramework + ' | ' + server.host + ':' + server.port,
  description: 'Your Page Description',
  author: 'Your Name',
  analyticssiteid: 'XXXXXXX'
};

var addLocals = function( newLocals, callback ) {
  newLocals = newLocals || {};
  console.log("newLocals : ", newLocals);
  for (var key in commonLocals) {
    newLocals[key] = commonLocals[key];
    console.log("newLocals[key] : ",key, ' : ' , newLocals[key]);
  }
  console.log("commonLocals : ", commonLocals);
  console.log("newLocals : ", newLocals);
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

/*
 *server.use(function (req, res, next) {
 *  if (req.session.loggedIn) {
 *    res.local('authenticated', true);
 *    app.users.findOne({ _id: mongodb.ObjectID.createFromHexString(req.session.loggedIn) }, function (err, doc) {
 *      if (err) return next(err);
 *      res.local('me', doc);
 *      next();
 *    });
 *  } else {
 *    res.local('authenticated', false);
 *    next();
 *  }
 *});
 */

/** Middleware for limited access */
function requireLogin (req, res, next) {
  if (req.session.username) {
    // User is authenticated, let him in
    next();
  } else {
    // Otherwise, we redirect him to login form
    res.redirect("/login");
  }
}

/** Login form */
server.get("/login", function (req, res) {
    addLocals( null, function( err, locals) {
      locals.error = null;
      locals.login = '';
      locals.title = 'Login | ' + locals.title;
      console.log("locals : ", locals);
      res.render('login.jade', {
        locals : locals
      });
    });
});


server.post("/redmine-key", function (req, res) {
    //console.log("key : ", req.body.key);
    //var redmineUser = server.redmine.getUserFromKey(req.body.key);
    server.redmine.getUserFromKey(req.body.key, function(err, data) {
      if (err) {
        res.render("login.jade", {
          username: '',
          error: "Api Key doesn't exists"
        });
      }
      else {
        var user = data.user;
        console.log("user : ", user);
        res.render('create-user.jade', {
          locals : {
            error: null,
            login:  user.mail.split('@')[0],
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
  var login = req.body.login;
  var password = req.body.password;
  var confirmPassword = req.body.confirmPassword;
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var last_login_on = req.body.last_login_on;
  var created_on = req.body.created_on;
  var mail = req.body.mail;
  var id = req.body.id;

  if (password !== confirmPassword) {
      res.render('create-user.jade', {
        locals : {
          error: "passwords must match",
          login:  login,
          firstname:  firstname,
          lastname:  lastname,
          last_login_on: last_login_on,
          created_on: created_on,
          mail: mail,
          id: id
        }
      });
  }
  else {
    delete req.body.confirmPassword;
    server.redmine.createUser(req.body);
    res.render('login.jade', {
      login: login,
      error: null
    });
  }
});

server.post("/login", function (req, res) {
  var login = req.body.login;
  server.redmine.getAppUser(req.body, function(err, data) {
    if (!data) {
      res.render('login.jade', {
        login: login,
        error: "Wrong login or password"
      });
    }
    else {
      console.log("logged in ! : ");
      req.session.username = req.body.login;
      server.users[req.session.username] = {};
      server.redmine.connectUser( req.session.username, function(err, data){
        res.redirect('/');
      });
    }
  });
});

server.get('/logout', function (req, res) {
  server.redmine.disconnectUser( req.session.username, function(err, data){
    delete server.users[req.session.username];
    req.session.username = null;
    console.log(" server.users: ", server.users);
    res.redirect('/');
  });
});

server.get('/extract', function(req,res){
  res.render('extract.jade', {
    locals : {
      title : server.host + ':' + server.port + ' | skProject | ' + server.config.clientFramework ,
      description: 'Your Page Description',
      author: 'Your Name',
      analyticssiteid: 'XXXXXXX'
    }
  });
});

server.get("/account", [requireLogin], function (req, res) {
  var requestLogin = { login: req.session.username };
  server.redmine.getAppUser(requestLogin, function(err, data) {
    if (data) {
      addLocals( data, function() {
        data.error = null;
        data.username = req.session.username;
        data.title = 'Account | ' + data.title;
        console.log("data : ", data);
        res.render('account.jade', {
          locals : data
        });
      });
    }
  });
});

server.get('/', [requireLogin], function(req,res){
  //res.render('index-' + server.config.clientFramework+ '.jade', function() {});
  /*
   *res.render('index-' + server.config.clientFramework+ '.jade', function(err, html){
   *  console.log("err : ", err);
   *  console.log("html : ", html);
   *});
   */
  addLocals( null, function( err, locals ) {
    locals.error = null;
    locals.username = req.session.username;
    locals.title = 'Team | ' + locals.title;
    res.render('index-' + server.config.clientFramework+ '.jade', {
      locals : locals
    });
  });
  //var locals = addLocals();
  //res.render('index-' + server.config.clientFramework+ '.jade', locals);
  /*
   *res.render('index-' + server.config.clientFramework+ '.jade', {
   *  locals : {
   *    title : server.host + ':' + server.port + ' | skProject | ' + server.config.clientFramework ,
   *    description: 'Your Page Description',
   *    author: 'Your Name',
   *    analyticssiteid: 'XXXXXXX',
   *    username: req.session.username
   *  }
   *});
   */
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


console.log('Listening on '.info + (server.host + ':' + server.port).inverse.info );
console.log(('Using client framework ' + server.config.clientFramework).info );
