console.log("»»»»»eventsManager load««««««".verbose);
var EventEmitter = require('events').EventEmitter;
//var eventsManager = new EventEmitter();
var io = require('socket.io');
var util = require('util');

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

    io.sockets.on('connection', function(socket){
        eventsManager.connect(socket);

        socket.on('disconnect', function(){
            console.log('Client Disconnected.');
        });
    });

};

eventsManager.connect = function(socket) {

    //console.log("eventsManager.connect : ");
    socket.emit('redmine::connect');

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

    socket.on('redmine::sync', function(data){
        //console.log("eventsManager redmine::sync : ");
        eventsManager.emit('redmine::sync');
    });

    socket.on('getDatabaseState', function(){
        //console.log("eventsManager getDatabaseState : ");
        eventsManager.emit('getDatabaseState');
    });

    eventsManager.on('databaseState', function(data) {
        socket.emit('databaseState', data);
    });

    socket.on('setUsersIssues', function(callback){
        //console.log("eventsManager setUsersIssues : ");
        eventsManager.emit('setUsersIssues', function(err, data){
            callback(err, data);
        });
    });

    socket.on('getUsers', function(callback){
        //console.log("eventsManager getUsers : ");
        eventsManager.emit('getUsers', function(err, data){
            callback(err, data);
        });
    });

    socket.on('getIssues', function(callback){
        //console.log("eventsManager getIssues : ");
        eventsManager.emit('getIssues', function(err, data){
            callback(err, data);
        });
    });

    eventsManager.on('updateCurrentIssue::response', function(data){
        //console.log("updateCurrentIssue::response : ");
        socket.emit('updateCurrentIssue::response', data);
    });

    socket.on('redmine::getCompleteIssue', function(id, callback){
        //console.log("eventsManager redmine::getCompleteIssue : ");
        eventsManager.emit('redmine::getCompleteIssue', id, function(err, data){
            callback(err, data);
        });
    });

    socket.on('redmine::getUserIssues', function(id, callback){
        //console.log("eventsManager redmine::getUserIssues : ");
        id = id.split('_')[1];
        socket.emit('log', id);
        eventsManager.emit('redmine::getUserIssues', function(err, data){
            callback(data);
        });
    });

    socket.on('setSkProjects', function(){
        //console.log("eventsManager setSkProjects : ");
        //console.log("setSkProjects : ");
        eventsManager.emit('setSkProjects', function(err, data){
            socket.emit('log', data);
        });
    });
    socket.on('getSkProjects', function(){
        //console.log("eventsManager getSkProjects : ");
        eventsManager.emit('getSkProjects', function(err, data){
            socket.emit('getSkProjects::response', data);
        });
    });

    socket.on('redmine::getIssue', function(id, callback){
        //console.log("eventsManager redmine::getIssue : ");
        eventsManager.emit('redmine::getIssue', function(err, data){
            callback(data);
        });
    });

    socket.on('syncIssues', function(){
        //console.log("eventsManager syncIssues : ");
        eventsManager.emit('syncIssues');
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
        socket.emit('log', data);
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
