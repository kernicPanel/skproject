console.log("»»»»»eventsManager load««««««".verbose);
var EventEmitter = require('events').EventEmitter;
//var eventsManager = new EventEmitter();
var io = require('socket.io');
var util = require('util');
var connect = require('connect');
var parseCookie = connect.utils.parseCookie;

var EventsManager = function() {};
util.inherits(EventsManager, EventEmitter);
var eventsManager = new EventsManager();

//Setup Socket.IO
eventsManager.init = function(server) {
  console.log("»    eventsManager init     «");
  io = io.listen(server);
  io.set('log level', 1);

  /*
   *eventsManager.on('log', function(data){
   *    console.log("data : ", data);
   *});
   */
  io.set('authorization', function (data, accept) {
    if (!data.headers.cookie)
    return accept('No cookie transmitted.', false);

    data.cookie = parseCookie(data.headers.cookie);
    data.sessionID = data.cookie['express.sid'];

    server.sessionStore.load(data.sessionID, function (err, session) {
      if (err || !session) return accept('Error', false);

      data.session = session;
      //console.log("session : ", session);
      return accept(null, true);
    });
  });

  io.sockets.on('connection', function(socket){
    var sess = socket.handshake.session;
    //console.log("sess : ", sess);
    console.log(
      'a socket with sessionID',
      socket.handshake.sessionID,
      'connected'
    );
    eventsManager.connect(socket);

    socket.on('disconnect', function(){
      console.log('Client Disconnected.');
    });
  });

};

eventsManager.on('irc::updateCurrentIssue', function(currentIssue){
    // console.log("irc::updateCurrentIssue currentIssue : ", currentIssue);
    eventsManager.emit('timer::updateCurrentIssue', currentIssue);
});


eventsManager.connect = function(socket) {
  //console.log("socket : ", socket);

  //console.log("socket.handshake.session.username: ", socket.handshake.session.username);
  //console.log("server.users : ", server.users);
  var username = socket.handshake.session.username;
  //console.log("username : ", username);

  server.addUser( username, function(){} );

    //console.log("eventsManager.connect : ");
    socket.emit('redlive::connect');

    socket.on('redmineExtract::sync', function(data){
        console.log("eventsManager redmineExtract::sync : ");
        eventsManager.emit('redmineExtract::sync');
    });

    socket.on('redmineExtract::buildStats', function(callback){
        console.log("eventsManager redmineExtract::buildStats : ");
        eventsManager.emit('redmineExtract::buildStats', function(err, data){
            callback(err, data);
        });
    });

    socket.on('redmineExtract::getIssues', function(callback){
        console.log("eventsManager redmineExtract::getIssues : ");
        eventsManager.emit('redmineExtract::getIssues', function(err, data){
            callback(err, data);
        });
    });

    socket.on('redmineExtract::getSupport', function(callback){
        console.log("eventsManager redmineExtract::getSupport : ");
        eventsManager.emit('redmineExtract::getSupport', function(err, data){
            callback(err, data);
        });
    });

    socket.on('redmineExtract::getGarantie', function(callback){
        console.log("eventsManager redmineExtract::getGarantie : ");
        eventsManager.emit('redmineExtract::getGarantie', function(err, data){
            callback(err, data);
        });
    });

    eventsManager.on('redmineExtract::getIssues::response', function(data){
        //console.log("redmineExtract::getIssues::response : ");
        socket.emit('redmineExtract::getIssues::response', data);
    });

    socket.on('redmineExtract::getProjects', function(callback){
        console.log("eventsManager redmineExtract::getProjects : ");
        eventsManager.emit('redmineExtract::getProjects', function(err, data){
            callback(err, data);
        });
    });

    socket.on('sync', function(data){
        //console.log("eventsManager redmine::sync : ");
        eventsManager.emit('redmine::sync');
    });

    socket.on('getDatabaseState', function(){
        //console.log("eventsManager getDatabaseState : ");
        eventsManager.emit('redmine::getDatabaseState');
    });

    eventsManager.on('redmine::databaseState', function(data) {
        socket.emit('databaseState', data);
    });

    socket.on('setUsersIssues', function(callback){
        //console.log("eventsManager setUsersIssues : ");
        eventsManager.emit('redmine::setUsersIssues', function(err, data){
            callback(err, data);
        });
    });

    socket.on('getUsers', function(data, callback){
        // console.log("eventsManager getUsers : ", data);
        eventsManager.emit('redmine::getUsers', function(err, data){
            callback(err, data);
        });
    });

    socket.on('getUserIssues', function(id, callback){
        // console.log("eventsManager redmine::getUserIssues : ", id);
        // socket.emit('log', id);
        eventsManager.emit('redmine::getUserIssues', id, function(err, data){
            // console.log("eventsManager redmine::getUserIssues data : ", data);
            callback(err, data);
        });
    });

    socket.on('getIssues', function(data, callback){
        //console.log("eventsManager getIssues : ");
        eventsManager.emit('redmine::getIssues', function(err, data){
            callback(err, data);
        });
    });

    eventsManager.on('timer::currentIssueUpdated', function(currentIssue){
        // console.log("timer::currentIssueUpdated currentIssue : ", currentIssue);
        socket.emit('currentIssueUpdated', currentIssue);
    });

    socket.on('getCompleteIssue', function(id, callback){
        //console.log("eventsManager redmine::getCompleteIssue : ");
        eventsManager.emit('redmine::getCompleteIssue', id, function(err, data){
            callback(err, data);
        });
    });

    socket.on('startIssue', function(id, callback){
      //var username = server.users[socket.handshake.session.username];
      console.log("username !!!!!!! : ", username);
      eventsManager.emit('redmine::startIssue', username, id, function(err, data){
          callback(err, data);
      });
    });

    socket.on('pauseIssue', function( callback ){
        eventsManager.emit('redmine::pauseIssue', username, function(err, data){
            callback(err, data);
        });
    });

    socket.on('stopIssue', function( callback ){
        eventsManager.emit('redmine::stopIssue', username, function(err, data){
            callback(err, data);
        });
    });

    // socket.on('getUserIssues', function(id, callback){
    //     //console.log("eventsManager redmine::getUserIssues : ");
    //     id = id.split('_')[1];
    //     socket.emit('log', id);
    //     eventsManager.emit('redmine::getUserIssues', function(err, data){
    //         callback(data);
    //     });
    // });

    socket.on('setSkProjects', function(){
        //console.log("eventsManager setSkProjects : ");
        //console.log("setSkProjects : ");
        eventsManager.emit('redmine::setSkProjects', function(err, data){
            socket.emit('log', data);
        });
    });
    socket.on('getSkProjects', function(){
        //console.log("eventsManager getSkProjects : ");
        eventsManager.emit('redmine::getSkProjects', function(err, data){
            socket.emit('redmine::getSkProjects::response', data);
        });
    });

    socket.on('getIssue', function(id, callback){
        //console.log("eventsManager redmine::getIssue : ");
        eventsManager.emit('redmine::getIssue', function(err, data){
            callback(data);
        });
    });

    socket.on('syncIssues', function(){
        //console.log("eventsManager syncIssues : ");
        eventsManager.emit('redmine::syncIssues');
    });
    eventsManager.on('createIssue', function(issue){
        //console.log("eventsManager createIssue : ");
        socket.emit('createIssue', issue);
    });
    eventsManager.on('updateIssue', function(issue){
        //console.log("eventsManager updateIssue : ");
        socket.emit('updateIssue', issue);
    });

    eventsManager.on('log', function(data){
        //console.log("eventsManager log : ");
        var e = new Error();
        socket.emit('log', e.stack.split('\n')[3].split('at ')[1], data);
    });

    /*
     *event / socket.io tests
     */
    eventsManager.on('eventToEventTest', function(data){
        eventsManager.emit('eventToEventTest::response');
    });

    eventsManager.on('eventToSocketTest', function(data){
        socket.emit('eventToSocketTest::response');
    });

    socket.on('socketToEventTest', function(data){
        eventsManager.emit('socketToEventTest::response');
    });

    socket.on('socketToSocketTest', function(data){
        socket.emit('socketToSocketTest::response');
    });

};

module.exports = eventsManager;
