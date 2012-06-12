var path = require('path'),
    util = require('util'),
    mongoose = require('mongoose');
var ioClient = require('socket.io-client');

var basedir = path.join(__dirname, '..');
var libdir = path.join(basedir, 'lib');

var config = require(path.join(libdir, 'config.example.js'));
var host = (process.env.HOST || config.server.host);
//var port = (process.env.PORT || config.server.port);
var port = Math.floor(Math.random() * 10000);
var socketUrl = 'http://' + host + ':' + port;
var options ={
    transports: ['websocket'],
    'force new connection': true
};

var eventsManager = require(path.join(libdir, 'eventsManager.js'));
eventsManager.init(port);
var client = ioClient.connect(socketUrl, options);

console.log("testing eventsManager on port " + port);

describe('eventsManager', function(){

    it('should be an object', function() {
        eventsManager.should.be.a('object');
    });

    it('should be a function', function() {
        eventsManager.connect.should.be.a('function');
    });

    it('should emit "redmine::connect" socket.io event on client connexion', function(done) {
        client.on('redmine::connect', done);
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
        eventsManager.on('getUsers', function() {
            done();
        });
        client.emit('getUsers', function(err, data) {
        });
    });
});
