var path = require('path'),
    util = require('util'),
    mongoose = require('mongoose');
var ioClient = require('socket.io-client');
//var ioServer = require('socket.io-client');

var basedir = path.join(__dirname, '..');
var libdir = path.join(basedir, 'lib');

var server = require(path.join(basedir, 'server.js'));
var config = require(path.join(libdir, 'config.js'));
var host = (process.env.HOST || config.server.host);
var port = (process.env.PORT || config.server.port);
var socketUrl = 'http://' + host + ':' + port;
var options ={
    transports: ['websocket'],
    'force new connection': true
};

console.log("socketUrl : ", socketUrl);
var eventsManager = require(path.join(libdir, 'eventsManager.js'));

eventsManager.on('*', function(err, data) {
    console.log("data : ", data);
    console.log("err : ", err);
});

describe('eventsManager', function(){

    console.log("in describe ");
    //describe('connect', function(){

        //var client = ioClient.connect(socketUrl, options);

        /*
         *after(function(done){
         *    client.disconnect();
         *});
         */

        it('should be an object', function() {
            eventsManager.should.be.a('object');
        });

        it('should be a function', function() {
            eventsManager.connect.should.be.a('function');
        });

        it('should emit "redmine::connect" socket.io event on client connexion', function(done) {
            var client = ioClient.connect(socketUrl, options);
            //client.on('connect', function(data) {
                client.on('redmine::connect', done);
            //});
            client.disconnect();
        });

        /*
         *it('should emit "getUsers::response" socket.io event on "getUsers" socket.io event', function(done) {
         *    var client = ioClient.connect(socketUrl, options);
         *    client.on('redmine::connect', function() {
         *    //client.on('connect', function(data) {
         *        //client.on('getUsers::response', done);
         *        client.emit('getUsers');
         *        eventsManager.on('getUsers', done);
         *    });
         *    client.disconnect();
         *});
         */
    //});

});
