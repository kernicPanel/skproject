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

var EventsManager = function() {};
util.inherits(EventsManager, EventEmitter);
var eventsManager = new EventsManager();

//Setup Socket.IO
eventsManager.init = function(server) {
  console.log("»    eventsManager init     «");
  io = io.listen(server);
  io.set('log level', 1);

  io.set('authorization', function (data, accept) {
    if (!data.headers.cookie)
    return accept('No cookie transmitted.', false);

    data.cookie = parseCookie(data.headers.cookie);
    data.sessionID = data.cookie['express.sid'];

    server.sessionStore.load(data.sessionID, function (err, session) {
      if (err || !session) return accept('Error', false);

      data.session = session;
      return accept(null, true);
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

eventsManager.on('irc::updateCurrentIssue', function(currentIssue){
    // console.log("irc::updateCurrentIssue currentIssue : ", currentIssue);
    eventsManager.emit('redmine::updateCurrentIssue', currentIssue);
});

eventsManager.connect = function(socket) {
  var login = socket.handshake.session.login;

  server.addUser( login, function(){} );

    socket.emit('realTeam::connect');

    socket.on('redmineStats::sync', function(data){
        console.log("eventsManager redmineStats::sync : ");
        eventsManager.emit('redmineStats::sync');
    });

    eventsManager.on('rebuild::on', function () {
        eventsManager.emit('stopAutoUpdate');
    });

    eventsManager.on('rebuild::off', function () {
        eventsManager.emit('startAutoUpdate');
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

    eventsManager.on('redmineStats::getStats::response', function(data){
        //console.log("redmineStats::getStats::response : ");
        socket.emit('redmineStats::getStats::response', data);
    });

    eventsManager.on('redmineStats::getStats::done', function(data){
        //console.log("redmineStats::getStats::done : ");
        socket.emit('redmineStats::getStats::done', data);
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

    eventsManager.on('redmineStats::getIssues::response', function(data){
        //console.log("redmineStats::getIssues::response : ");
        socket.emit('redmineStats::getIssues::response', data);
    });

    eventsManager.on('redmineStats::getIssues::done', function(data){
        //console.log("redmineStats::getIssues::done : ");
        socket.emit('redmineStats::getIssues::done', data);
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

    eventsManager.on('redmine::databaseState', function(data) {
        socket.emit('databaseState', data);
    });

    socket.on('fetchUsers', function(data, callback){
        //console.log("eventsManager setUsersIssues : ");
        eventsManager.emit('redmine::fetchUsers', function(err, data){
            callback(err, data);
        });
    });

    socket.on('createTeam', function(data, callback){
        //console.log("eventsManager setUsersIssues : ");
        eventsManager.emit('redmine::createTeam', function(err, data){
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

    eventsManager.on('timer::getCurrentIssues::response', function(issue, callback){
        socket.emit('getCurrentIssues::response', issue);
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

    eventsManager.on('redmine::currentIssueUpdated', function(currentIssue){
        // console.log("irc::updateCurrentIssue currentIssue : ", currentIssue);
        socket.emit('redmine::currentIssueUpdated', currentIssue);
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
      //var login = server.users[socket.handshake.session.login];
      console.log("startIssue : ", login, id);
      eventsManager.emit('timer::start', login, id, function(err, data){
           callback(err, data);
        socket.broadcast.emit('startCurrentIssue', data);
        socket.emit('startCurrentIssue', data);
        //eventsManager.emit('log', data);
      });
    });

    socket.on('pauseIssue', function( callback ){
      console.log("pauseIssue : ", login);
        eventsManager.emit('timer::pause', login, function(err, data){
             callback(err, data);
            socket.broadcast.emit('pauseCurrentIssue', data);
            socket.emit('pauseCurrentIssue', data);
        });
    });

    socket.on('stopIssue', function(  callback ){
        console.log("stopIssue : ", login);
        eventsManager.emit('timer::stop', login, function(err, data){
            callback(err, data);
            socket.emit('prefillAddtime', data);
        });
    });

    socket.on('addTime', function(issue, callback){
        //var login = server.users[socket.handshake.session.login];
        console.log("addTime : ", login, issue);
        // eventsManager.emit('log', issue);
        eventsManager.emit('timer::addtime', login, issue, function(err, data){
            callback(err, data);
        });
    });

    eventsManager.on('timer::stopCurrentIssue', function(login){
        socket.emit('stopCurrentIssue', login);
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
    eventsManager.on('createIssue', function(issue){
        //console.log("eventsManager createIssue : ");
        socket.emit('createIssue', issue);
    });
    eventsManager.on('updateIssue', function(issue){
        //console.log("eventsManager updateIssue : ");
        socket.emit('updateIssue', issue);
    });

    eventsManager.on('syncStart', function(message){
        //console.log("eventsManager syncStart : ");
        socket.emit('syncStart', message);
    });

    eventsManager.on('syncPending', function(message){
        //console.log("eventsManager syncPending : ");
        socket.emit('syncPending', message);
    });

    eventsManager.on('syncDone', function(message){
        //console.log("eventsManager syncDone : ");
        socket.emit('syncDone', message);
    });

    eventsManager.on('log', function(data){
        //console.log("eventsManager log : ");
        var e = new Error();
        socket.emit('log', e.stack.split('\n')[3].split('at ')[1], data);
    });

    eventsManager.on('broadLog', function(data){
        //console.log("eventsManager log : ");
        var e = new Error();
        socket.broadcast.emit('log', e.stack.split('\n')[3].split('at ')[1], data);
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
