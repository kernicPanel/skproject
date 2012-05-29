console.log("»»»»»eventsManager load««««««");
var EventEmitter = require('events').EventEmitter;
//var eventsManager = new EventEmitter();
var io = require('socket.io');
var util = require('util');

var EventsManager = function() {};
util.inherits(EventsManager, EventEmitter);
var eventsManager = new EventsManager();

//Setup Socket.IO
eventsManager.init = function(server) {
    console.log("»»»»»eventsManager init««««««");
    io = io.listen(server);
    io.set('log level', 1);

    eventsManager.on('log', function(data){
        console.log("data : ", data);
    });

    io.sockets.on('connection', function(socket){
        eventsManager.connect(socket);

        socket.on('disconnect', function(){
            console.log('Client Disconnected.');
        });
    });

};

eventsManager.connect = function(socket) {

    console.log("eventsManager.connect : ");
    socket.emit('redmine::connect');

    eventsManager.on('eventToEventTest', function(data){
        eventsManager.emit('eventToEventTest::response');
    });

    eventsManager.on('eventToSocketTest', function(data){
        //eventsManager.emit('test::response');
        socket.emit('eventToSocketTest::response');
    });

    socket.on('socketToEventTest', function(data){
        //eventsManager.emit('test::response');
        eventsManager.emit('socketToEventTest::response');
    });

    socket.on('socketToSocketTest', function(data){
        //eventsManager.emit('test::response');
        socket.emit('socketToSocketTest::response');
    });

    socket.on('redmine::sync', function(data){
        console.log("eventsManager redmine::sync : ");
        eventsManager.emit('redmine::sync');
    });

    socket.on('getDatabaseState', function(){
        console.log("eventsManager getDatabaseState : ");
        socket.emit('databaseState', {state: mongoose.connection.readyState});
    });

    socket.on('setUsersIssues', function(callback){
        console.log("eventsManager setUsersIssues : ");
        eventsManager.emit('setUsersIssues', function(err, data){
            callback(err, data);
        });
    });

    socket.on('getUsers', function(callback){
        console.log("eventsManager getUsers : ");
        //eventsManager.emit('getUsers');
        eventsManager.emit('getUsers', function(err, data){
            callback(err, data);
        });
    });

    socket.on('getIssues', function(callback){
        console.log("eventsManager getIssues : ");
        eventsManager.emit('getIssues', function(err, data){
            callback(err, data);
        });
    });

    eventsManager.on('updateCurrentIssue::response', function(data){
        //console.log("updateCurrentIssue::response : ");
        socket.emit('updateCurrentIssue::response', data);
    });

    socket.on('redmine::getCompleteIssue', function(id, callback){
        console.log("eventsManager redmine::getCompleteIssue : ");
        eventsManager.emit('redmine::getCompleteIssue', id, function(err, data){
            callback(err, data);
        });
    });

    socket.on('redmine::getUserIssues', function(id, callback){
        console.log("eventsManager redmine::getUserIssues : ");
        id = id.split('_')[1];
        socket.emit('log', id);
        //redmine.getUserIssues( id, function(err, data) {
        eventsManager.emit('redmine::getUserIssues', function(err, data){
            callback(data);
        });
    });

    socket.on('setSkProjects', function(){
        console.log("eventsManager setSkProjects : ");
        console.log("setSkProjects : ");
        //redmine.setSkProjects( function(err, data) {
        eventsManager.emit('setSkProjects', function(err, data){
            socket.emit('log', data);
        });
    });
    socket.on('getSkProjects', function(){
        console.log("eventsManager getSkProjects : ");
        //redmine.getSkProjects( function(err, data) {
        eventsManager.emit('getSkProjects', function(err, data){
            socket.emit('getSkProjects::response', data);
        });
    });

    socket.on('redmine::getIssue', function(id, callback){
        console.log("eventsManager redmine::getIssue : ");
        //redmine.getIssue( id, function(err, data) {
        eventsManager.emit('redmine::getIssue', function(err, data){
            callback(data);
        });
    });

    socket.on('syncIssues', function(){
        console.log("eventsManager syncIssues : ");
        console.log("PUUUUUTE : ");
        //redmine.syncIssues();
        eventsManager.emit('syncIssues');
    });
    eventsManager.on('createIssue', function(issue){
        console.log("eventsManager createIssue : ");
        socket.emit('createIssue', issue);
    });
    eventsManager.on('updateIssue', function(issue){
        console.log("eventsManager updateIssue : ");
        socket.emit('updateIssue', issue);
    });
    eventsManager.on('log', function(data){
        console.log("eventsManager log : ");
        socket.emit('log', data);
    });
};

module.exports = eventsManager;
