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

console.log("»»»»»eventsManager load««««««".verbose);
var EventEmitter = require('events').EventEmitter;
var io = require('socket.io');
var util = require('util');
var connect = require('connect');
var parseCookie = connect.utils.parseCookie;
var users = server.users;

var EventsManager = function() {};
util.inherits(EventsManager, EventEmitter);
var eventsManager = new EventsManager();

//Setup Socket.IO
eventsManager.init = function(server) {
  console.log("»    eventsManager init     «");
  io = io.listen(httpServer);
  io.set('log level', 1);

  io.set('authorization', function (data, accept) {
    if (!data.headers.cookie)
    return accept('No cookie transmitted.', false);

    data.cookie = server.cookieParser(data, {}, function(err){
      console.log("data: ", data.signedCookies['connect.sid']);
      data.sessionID = data.signedCookies['connect.sid'];

      //console.log("server.sessionStore : ", server.sessionStore);
      server.sessionStore.get(data.sessionID, function (err, session) {
        console.log("!!!!err : ", err);
        console.log("!!!!session : ", session);
        if (err || !session) return accept('Error REdis FaIL !', false);

        data.session = session;
        return accept(null, true);
      });
    });
  });

  io.sockets.on('connection', function(socket){
    var sess = socket.handshake.session;
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

eventsManager.on('buildIssueStats', function(id, callback){
    console.log("eventsManager buildIssueStats : ", id);
    eventsManager.emit('redmineStats::buildStats', id, function(err, data){
        callback(err, data);
    });
});

eventsManager.on('irc::getIrcUsers', function(callback){
    eventsManager.emit('redmine::getIrcUsers', function(err, ircUsers){
        callback(err, ircUsers);
    });
});

eventsManager.on('redmine::ircNick', function(id, ircNick){
    eventsManager.emit('irc::addIrcNick', id, ircNick);
});

eventsManager.on('irc::updateCurrentIssue', function(currentIssue){
    // console.log("irc::updateCurrentIssue currentIssue : ", currentIssue);
    eventsManager.emit('redmine::updateCurrentIssue', currentIssue);
});

/*
 *eventsManager.on('ircCommand::join', function(userId, callback){
 *  eventsManager.emit('redmine::ircJoin', userId, function(err, response){
 *    callback(err, response);
 *  });
 *});
 */

eventsManager.on('ircCommand::tasks', function(userId, callback){
  eventsManager.emit('redmine::ircTasks', userId, function(err, response){
    callback(err, response);
  });
});

eventsManager.on('ircCommand::task', function(userId, callback){
  eventsManager.emit('redmine::ircTask', userId, function(err, response){
    callback(err, response);
  });
});

eventsManager.on('ircCommand::start', function(userId, id, callback){
  eventsManager.emit('timer::ircStart', userId, id, function(err, response){
    callback(err, response);
  });
});

eventsManager.on('ircCommand::stop', function(userId, callback){
  eventsManager.emit('timer::ircStop', userId, function(err, response){
    callback(err, response);
  });
});

eventsManager.on('ircCommand::pause', function(userId, callback){
  eventsManager.emit('timer::ircPause', userId, function(err, response){
    callback(err, response);
  });
});

eventsManager.on('ircCommand::addtime', function(userId, timeEntry, callback){
  eventsManager.emit('timer::ircAddtime', userId, timeEntry, function(err, response){
    callback(err, response);
  });
});

eventsManager.on('rebuild::on', function () {
    eventsManager.emit('stopAutoUpdate');
    eventsManager.emit('stopIRC');
});

eventsManager.on('rebuild::off', function () {
    eventsManager.emit('startAutoUpdate');
    eventsManager.emit('startIRC');
});

eventsManager.on('timer::issuePaused', function(issue){
  io.sockets.emit('issuePaused', issue);
});

eventsManager.on('timer::issueStopped', function(userId){
  io.sockets.emit('issueStopped', userId);
});

eventsManager.on('timer::addTimeOk', function(time_entry){
  io.sockets.emit('addTimeOk', time_entry);
});

eventsManager.on('timer::addTimeError', function(err, params){
  io.sockets.emit('addTimeError', err, params);
});

eventsManager.on('issueStarted', function(currentIssue){
  io.sockets.emit('issueStarted', currentIssue);
});

eventsManager.on('redmineStats::getStats::response', function(data){
  //console.log("redmineStats::getStats::response : ");
  io.sockets.emit('redmineStats::getStats::response', data);
});

eventsManager.on('redmineStats::getStats::done', function(data){
  //console.log("redmineStats::getStats::done : ");
  io.sockets.emit('redmineStats::getStats::done', data);
});

eventsManager.on('redmineStats::getIssues::response', function(data){
  //console.log("redmineStats::getIssues::response : ");
  io.sockets.emit('redmineStats::getIssues::response', data);
});

eventsManager.on('redmineStats::getIssues::done', function(data){
  //console.log("redmineStats::getIssues::done : ");
  io.sockets.emit('redmineStats::getIssues::done', data);
});

eventsManager.on('redmine::databaseState', function(data) {
  io.sockets.emit('databaseState', data);
});

eventsManager.on('timer::getCurrentIssues::response', function(issue, callback){
  io.sockets.emit('getCurrentIssues::response', issue);
});

eventsManager.on('redmine::currentIssueUpdated', function(currentIssue){
  // console.log("irc::updateCurrentIssue currentIssue : ", currentIssue);
  io.sockets.emit('redmine::currentIssueUpdated', currentIssue);
});

eventsManager.on('timer::currentIssueUpdated', function(currentIssue){
  // console.log("timer::currentIssueUpdated currentIssue : ", currentIssue);
  io.sockets.emit('currentIssueUpdated', currentIssue);
});

eventsManager.on('createIssue', function(issue){
  //console.log("eventsManager createIssue : ");
  io.sockets.emit('createIssue', issue);
});
eventsManager.on('updateIssue', function(issueID, detail){
  //console.log("eventsManager updateIssue : ");
  io.sockets.emit('updateIssue', issueID, detail);
});

eventsManager.on('addUserIssue', function(data){
  //console.log("eventsManager updateIssue : ");
  io.sockets.emit('addUserIssue', data);
});

eventsManager.on('removeUserIssue', function(data){
  //console.log("eventsManager updateIssue : ");
  io.sockets.emit('removeUserIssue', data);
});

eventsManager.on('syncStart', function(message){
  //console.log("eventsManager syncStart : ");
  io.sockets.emit('syncStart', message);
});

eventsManager.on('syncPending', function(message){
  //console.log("eventsManager syncPending : ");
  io.sockets.emit('syncPending', message);
});

eventsManager.on('syncDone', function(message){
  //console.log("eventsManager syncDone : ");
  io.sockets.emit('syncDone', message);
});

eventsManager.on('log', function(data){
  //console.log("eventsManager log : ");
  var e = new Error();
  io.sockets.emit('log', e.stack.split('\n')[3].split('at ')[1], data);
});

/*
 *eventsManager.on('broadLog', function(data){
 *    //console.log("eventsManager log : ");
 *    var e = new Error();
 *    io.sockets.broadcast.emit('log', e.stack.split('\n')[3].split('at ')[1], data);
 *});
 */


eventsManager.connect = function(socket) {
  var login = socket.handshake.session.login;

  server.addUser( login, function(){} );

    socket.emit('realTeam::connect');

    socket.on('redmineStats::sync', function(data){
        console.log("eventsManager redmineStats::sync : ");
        eventsManager.emit('redmineStats::sync');
    });

    socket.on('redmineStats::buildStats', function(id, callback){
        console.log("eventsManager redmineStats::buildStats : ", id);
        eventsManager.emit('redmineStats::buildStats', id, function(err, data){
            callback(err, data);
        });
    });

    socket.on('redmineStats::getStats', function(settings, callback){
        console.log("eventsManager redmineStats::getStats : ", settings);
        eventsManager.emit('redmineStats::getStats', settings, function(err, data){
            callback(err, data);
        });
    });

    socket.on('redmineStats::getIssuesStats', function(settings, callback){
        console.log("eventsManager redmineStats::getIssuesStats : ", settings);
        eventsManager.emit('redmineStats::getIssuesStats', settings, function(err, data){
            callback(err, data);
        });
    });

    socket.on('redmineStats::getIssues', function(callback){
        console.log("eventsManager redmineStats::getIssues : ");
        eventsManager.emit('redmineStats::getIssues', function(err, data){
            callback(err, data);
        });
    });

    socket.on('redmineStats::getSupport', function(callback){
        console.log("eventsManager redmineStats::getSupport : ");
        eventsManager.emit('redmineStats::getSupport', function(err, data){
            callback(err, data);
        });
    });

    socket.on('redmineStats::getGarantie', function(callback){
        console.log("eventsManager redmineStats::getGarantie : ");
        eventsManager.emit('redmineStats::getGarantie', function(err, data){
            callback(err, data);
        });
    });

    socket.on('redmineStats::getProjects', function(callback){
        console.log("eventsManager redmineStats::getProjects : ");
        eventsManager.emit('redmineStats::getProjects', function(err, data){
            callback(err, data);
        });
    });

    socket.on('redmineStats::setProject', function(id, callback){
        console.log("eventsManager redmineStats::setProject : ", id);
        eventsManager.emit('redmineStats::setProject', id, function(err, project){
            callback(err, project);
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

    socket.on('fetchRedmineUsers', function(data, callback){
        //console.log("eventsManager setUsersIssues : ");
        eventsManager.emit('redmine::fetchRedmineUsers', function(err, data){
            callback(err, data);
        });
    });

    socket.on('createTeam', function(data, callback){
        //console.log("eventsManager setUsersIssues : ");
        eventsManager.emit('redmine::createTeam', function(err, data){
            callback(err, data);
        });
    });

    socket.on('createProjects', function(data, callback){
        //console.log("eventsManager setUsersIssues : ");
        eventsManager.emit('redmine::createProjects', function(err, data){
            callback(err, data);
        });
    });

    socket.on('getUsers', function(data, callback){
        // console.log("eventsManager getUsers : ", data);
        eventsManager.emit('redmine::getUsers', function(err, data){
            callback(err, data);
        });
    });

    socket.on('getCurrentIssues', function(data, callback){
        // console.log("eventsManager getUsers : ", data);
        eventsManager.emit('timer::getCurrentIssues', function(err, issues){
            callback(err, issues);
        });
    });

    socket.on('getUserIssues', function(id, callback){
        // console.log("eventsManager redmine::getUserIssues : ", id);
        // socket.emit('log', id);
        eventsManager.emit('redmine::getUserIssues', id, function(err, data){
            callback(err, data);
        });
    });

    socket.on('getIssues', function(data, callback){
        //console.log("eventsManager getIssues : ");
        eventsManager.emit('redmine::getIssues', function(err, data){
            callback(err, data);
        });
    });

    socket.on('getCompleteIssue', function(id, callback){
        //console.log("eventsManager redmine::getCompleteIssue : ");
        eventsManager.emit('redmine::getCompleteIssue', id, function(err, data){
            callback(err, data);
        });
    });

    socket.on('startIssue', function(issueId, callback){
      //var login = server.users[socket.handshake.session.login];
      console.log("startIssue : ", login, issueId);
      var userId = users[login].id;
      eventsManager.emit('timer::start', userId, issueId, function(err, data){
           callback(err, data);
        socket.broadcast.emit('issueStarted', data);
        socket.emit('issueStarted', data);
        //eventsManager.emit('log', data);
      });
    });

    socket.on('pauseIssue', function( callback ){
      console.log("pauseIssue : ", login);
      var userId = users[login].id;
        eventsManager.emit('timer::pause', userId, function(err, data){
             callback(err, data);
            socket.broadcast.emit('issuePaused', data);
            socket.emit('issuePaused', data);
        });
    });

    socket.on('stopIssue', function(  callback ){
        console.log("stopIssue : ", login);
      var userId = users[login].id;
        eventsManager.emit('timer::stop', userId, function(err, data){
            callback(err, data);
            socket.emit('prefillAddtime', data);
        });
    });

    socket.on('addTime', function(issue, callback){
        //var login = server.users[socket.handshake.session.login];
        console.log("addTime : ", login, issue);
      var userId = users[login].id;
        // eventsManager.emit('log', issue);
        eventsManager.emit('timer::addtime', userId, issue, function(err, data){
            callback(err, data);
        });
    });


    socket.on('addtimeIssue', function(nullData,  callback ){
        eventsManager.emit('timer::addtime', login, function(err, data){
            callback(err, data);
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



    socket.on('testIssueUpdate', function(currentAssignation){
        // eventsManager.emit('log', currentAssignation);
        eventsManager.emit('redmine::testIssueUpdate', currentAssignation);
    });

    socket.on('checkLastIssue', function(){
        // eventsManager.emit('log', currentAssignation);
        eventsManager.emit('redmine::checkLastIssue');
    });

};

module.exports = eventsManager;
