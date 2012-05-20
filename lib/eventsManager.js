console.log("»»»»»eventsManager load««««««");
var EventEmitter = require('events').EventEmitter;
var eventsManager = new EventEmitter();

eventsManager.on('log', function(data){
    console.log("data : ", data);
});

eventsManager.connect = function(socket) {
    
    socket.emit('redmine::connect');

    socket.on('redmine::sync', function(data){
        console.log("eventsManager redmine::sync : ");
        //redmine.sync( function(err, data) {
        //});
        eventsManager.emit('redmine::sync');
    });

    socket.on('getDatabaseState', function(){
        console.log("eventsManager getDatabaseState : ");
        socket.emit('databaseState', {state: mongoose.connection.readyState});
    });

    socket.on('setUsersIssues', function(){
        console.log("eventsManager setUsersIssues : ");
        //redmine.setUsersIssues( function(err, data) {
        eventsManager.emit('setUsersIssues', function(err, data){
            socket.emit('log', data);
        });
    });

/*
 *    socket.on('getUsers', function(){
 *        console.log("eventsManager getUsers : ");
 *        //redmine.getUsers( function(err, data) {
 *        //eventsManager.emit('getUsers', function(err, data){
 *            //socket.emit('getUsers::response', data);
 *        //});
 *        eventsManager.emit('getUsers');
 *    });
 *
 *    socket.on('getUsers::response', function(err, data){
 *        socket.emit('getUsers::response', data);
 *    });
 */

    socket.on('getUsers', function(callback){
        console.log("eventsManager getUsers : ");
        //redmine.getUsers( function(err, data) {
        eventsManager.emit('getUsers', function(err, data){
            //console.log("eventsManager getUsers::response : ", data);
            socket.emit('getUsers::response', data);
            //callback(data);
        });
    });

    /*
     *eventsManager.on('getUsers::response', function(data){
     *    //console.log("eventsManager getUsers : ", data);
     *    socket.emit('getUsers::response', data);
     *});
     */

    socket.on('getIssues', function(callback){
        console.log("eventsManager getIssues : ");
        //redmine.getIssues( function(err, data) {
        eventsManager.emit('getIssues', function(err, data){
            //console.log("eventsManager getIssues::response : ", data);
            socket.emit('getIssues::response', data);
            //callback(data);
        });
    });

    /*
     *eventsManager.on('getIssues::response', function(data){
     *    //console.log("eventsManager getIssues : ", data);
     *    socket.emit('getIssues::response', data);
     *});
     */

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

    socket.on('redmine::getCompleteIssue', function(id, callback){
        console.log("eventsManager redmine::getCompleteIssue : ");
        socket.emit('log', id);

        //redmine.getCompleteIssue( id, function(err, data) {
        eventsManager.emit('redmine::getCompleteIssue', function(err, data){
            socket.emit('log', data);
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
