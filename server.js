//console.log("config : ", config);

//setup Dependencies
var connect = require('connect'),
    express = require('express'),
    colors = require('colors'),
    mongoose = require('mongoose'),
    mongoStore = require('connect-mongodb'),
    test = require('./lib/test.js');

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
server.configure(function(){
    //server.use(express.logger());
    server.use(express.logger({ format: '\x1b[1m:method\x1b[0m \x1b[33m:url\x1b[0m :response-time ms' }));
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({ secret: "shhhhhhhhh!"}));
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

server.irc = require('./lib/irc.js');
server.irc.init();


///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

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
    //req.session.message = 'Hello World';
    // Show form, default value = current username
    res.render("login.jade", {
      login: '',
      error: null
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
            lastLoginOn: user.last_login_on,
            createdOn: user.created_on,
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
  var lastLoginOn = req.body.lastLoginOn;
  var createdOn = req.body.createdOn;
  var mail = req.body.mail;
  var id = req.body.id;

  if (password !== confirmPassword) {
      res.render('create-user.jade', {
        locals : {
          error: "passwords must match",
          login:  login,
          firstname:  firstname,
          lastname:  lastname,
          lastLoginOn: lastLoginOn,
          createdOn: createdOn,
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
      res.redirect('/');
    }
  });
    /*
     *var options = { "username": req.body.username, "error": null };
     *if (!req.body.username) {
     *    options.error = "User name is required";
     *    res.render("login.jade", options);
     *} else if (req.body.username == req.session.username) {
     *    // User has not changed username, accept it as-is
     *    res.redirect("/");
     *} else if (!req.body.username.match(/^[a-zA-Z0-9\-_]{3,}$/)) {
     *    options.error = "User name must have at least 3 alphanumeric characters";
     *    res.render("login.jade", options);
     *} else {
     *    // Validate if username is free
     *    req.sessionStore.all(function (err, sessions) {
     *        if (!err) {
     *            var found = false;
     *            for (var i=0; i<sessions.length; i++) {
     *                var session = JSON.parse(sessions[i]); // Si les sessions sont stockées en JSON
     *                if (session.username == req.body.username) {
     *                    err = "User name already used by someone else";
     *                    found = true;
     *                    break;
     *                }
     *            }
     *        }
     *        if (err) {
     *            options.error = ""+err;
     *            res.render("login", options);
     *        } else {
     *            req.session.username = req.body.username;
     *            res.redirect("/");
     *        }
     *    });
     *}
     */
});

server.get('/logout', function (req, res) {
  req.session.username = null;
  res.redirect('/');
});

//server.get('/session-index', [requireLogin], function (req, res, next) {
server.get('/session-index', function (req, res, next) {
    req.session.index = (req.session.index || 0) + 1;
    res.render('session-index.jade', {
        locals : {
            name:  req.session.name,
        index:  req.session.index,
        sessId: req.sessionID,
        message: req.session.message
        }
    });
    console.log("req.session.username : ", req.session.username);
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
  server.redmine.getAppUser(req.session.username, function(err, data) {
    console.log("data : ", data);
    var login = data.login;
    var apiKey = data.key;
    console.log("apiKey : ", apiKey);
    var firstname = data.firstname;
    var lastname = data.lastname;
    var lastLoginOn = data.lastLoginOn;
    var createdOn = data.createdOn;
    var mail = data.mail;
    var id = data.id;
    data.error = null;
    res.render('account.jade', {
      locals : data
      /*
       *locals : {
       *  error: null,
       *  login:  login,
       *  firstname:  firstname,
       *  lastname:  lastname,
       *  lastLoginOn: lastLoginOn,
       *  createdOn: createdOn,
       *  mail: mail,
       *  apiKey: apiKey,
       *  id: id
       *}
       */
    });
    /*
     *if (err) {
     *  res.render("login.jade", {
     *    username: '',
     *    error: "Api Key doesn't exists"
     *  });
     *}
     *else {
     *  var user = data.user;
     *  console.log("user : ", user);
     *  res.render('create-user.jade', {
     *    locals : {
     *      login:  user.mail.split('@')[0],
     *      firstname:  user.firstname,
     *      lastname:  user.lastname,
     *      apiKey: req.body.key,
     *      lastLoginOn: user.last_login_on,
     *      createdOn: user.created_on,
     *      mail: user.mail,
     *      id: user.id
     *    }
     *  });
     *}
     */
  });
    /*
     *res.render("account.jade", {
     *  login: '',
     *  error: null
     *});
     */
});

server.get('/', [requireLogin], function(req,res){
//server.get('/', function(req,res){
  res.render('index-' + server.config.clientFramework+ '.jade', {
    locals : {
              title : server.host + ':' + server.port + ' | skProject | ' + server.config.clientFramework ,
              description: 'Your Page Description',
              author: 'Your Name',
              analyticssiteid: 'XXXXXXX',
              username: req.session.username
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


console.log('Listening on '.info + (server.host + ':' + server.port).inverse.info );
console.log(('Using client framework ' + server.config.clientFramework).info );
