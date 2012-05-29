var path = require('path'),
    util = require('util'),
    mongoose = require('mongoose');
var ioClient = require('socket.io-client');
//var ioServer = require('socket.io-client');

var basedir = path.join(__dirname, '..');
var libdir = path.join(basedir, 'lib');

//var server = require(path.join(basedir, 'server.js'));
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
eventsManager.init(port);

/*
 *eventsManager.on('*', function(err, data) {
 *    console.log("data : ", data);
 *    console.log("err : ", err);
 *});
 */

eventsManager.emit('log', 'test emitter!!!!');

describe('eventsManager', function(){

    console.log("in describe ");
    //describe('connect', function(){

        var client = ioClient.connect(socketUrl, options);

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
            //var client = ioClient.connect(socketUrl, options);
            //client.on('connect', function(data) {
                client.on('redmine::connect', done);
            //});
            //client.disconnect();
        });

        it('should emit "eventToEventTest::response" event on "eventToEventTest" event', function(done) {
            eventsManager.on('eventToEventTest::response', function() {
                done();
            });
            eventsManager.emit('eventToEventTest', function() {
            });
        });

        it('should emit "eventToSocketTest::response" socket.io event on "eventToSocketTest" event', function(done) {
            client.on('eventToSocketTest::response', function() {
                done();
            });
            eventsManager.emit('eventToSocketTest', function() {
            });
        });

        it('should emit "socketToEventTest::response" socket.io event on "socketToEventTest" event', function(done) {
            eventsManager.on('socketToEventTest::response', function() {
                done();
            });
            client.emit('socketToEventTest', function() {
            });
        });

        it('should emit "socketToSocketTest::response" socket.io event on "socketToSocketTest" event', function(done) {
            client.on('socketToSocketTest::response', function() {
                done();
            });
            client.emit('socketToSocketTest', function() {
            });
        });

        it('should emit "getUsers" event on "getUsers" socket.io event', function(done) {
                /*
                 *eventsManager.on('getUsers', function(err, data) {
                 *    if (err) throw err;
                 *    done();
                 *});
                 */
                eventsManager.on('getUsers', function() {
                    done();
                });
                client.emit('getUsers', function(err, data) {
                });
        });

         //client.disconnect();
    //});

});
