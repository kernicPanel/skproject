/*

Copyright (c) 2012 Nicolas Clerc <kernicpanel@nclerc.fr>

This file is part of realTeam.

realTeam is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

realTeam is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with realTeam.  If not, see <http://www.gnu.org/licenses/>.

*/

var path = require('path'),
    util = require('util'),
    mongoose = require('mongoose');
var ioClient = require('socket.io-client');

var basedir = path.join(__dirname, '..');
var libdir = path.join(basedir, 'lib');

var config = require(path.join(libdir, 'config.example.js'));
var host = (process.env.HOST || config.server.host);
//var port = (process.env.PORT || config.server.port);
var port = Math.floor(Math.random() * 1000 + 8000);
var socketUrl = 'http://' + host + ':' + port;
var options ={
    transports: ['websocket'],
    'force new connection': true
};

var eventsManager = require(path.join(libdir, 'eventsManager.js'));
eventsManager.init(port);
//eventsManager.setMaxListeners(500);
var client = ioClient.connect(socketUrl, options);
//var client = {};

console.log("testing eventsManager on port " + port);

describe('eventsManager', function(){
/*
 *    beforeEach(function(done){
 *        client = ioClient.connect(socketUrl, options);
 *        done();
 *    });
 *
 *    afterEach(function(done){
 *        client.disconnect();
 *        client = {};
 *        done();
 *    });
 */

    it('should be an object', function() {
        eventsManager.should.be.a('object');
    });

    describe('init', function(){
        it('should be a function', function() {
            eventsManager.init.should.be.a('function');
        });
    });

    describe('connect', function(){
        it('should be a function', function() {
            eventsManager.connect.should.be.a('function');
        });
    });

    it('should emit "redmine::connect" socket.io event on client connexion', function(done) {
        client.on('redmine::connect', done);
    });

    it('should emit redmine::sync event on redmire::sync socket.io event', function(done) {
        eventsManager.on('redmine::sync', function() {
            done();
        });
        client.emit('redmine::sync', null);
    });

    it('should emit getDatabaseState event on getDatabaseState socket.io event', function(done) {
        eventsManager.on('getDatabaseState', function() {
            done();
        });
        client.emit('getDatabaseState', null);
    });

    it('should emit databaseState socket.io event on databaseState event', function(done) {
        client.on('databaseState', function() {
            done();
        });
        eventsManager.emit('databaseState', null);
    });

    it('should emit "getUsers" event on "getUsers" socket.io event', function(done) {
        eventsManager.on('getUsers', function() {
            done();
        });
        client.emit('getUsers', null);
    });

    it('should emit setUsersIssues event on setUsersIssues socket.io event', function(done) {
        eventsManager.on('setUsersIssues', function() {
            done();
        });
        client.emit('setUsersIssues', null);
    });

    it('should emit getIssues event on getIssues socket.io event', function(done) {
        eventsManager.on('getIssues', function() {
            done();
        });
        client.emit('getIssues', null);
    });

    it('should emit updateCurrentIssue::response socket.io event on updateCurrentIssue::response event', function(done) {
        client.on('updateCurrentIssue::response', function() {
            done();
        });
        eventsManager.emit('updateCurrentIssue::response', null);
    });

    it('should emit redmine::getCompleteIssue event on redmine::getCompleteIssue socket.io event', function() {
        var id = 12;
        eventsManager.on('redmine::getCompleteIssue', function(responseId) {
            responseId.should.equal(id);
        });
        client.emit('redmine::getCompleteIssue',id , null);
    });

    it('should emit redmine::getUserIssues event on redmine::getUserIssues socket.io event', function(done) {
        var id = '12_12';
        eventsManager.on('redmine::getUserIssues', function() {
            done();
        });
        client.emit('redmine::getUserIssues',id , null);
    });

    it('should emit setSkProjects event on setSkProjects socket.io event', function(done) {
        eventsManager.on('setSkProjects', function() {
            done();
        });
        client.emit('setSkProjects', null);
    });

    it('should emit getSkProjects event on getSkProjects socket.io event', function(done) {
        eventsManager.on('getSkProjects', function() {
            done();
        });
        client.emit('getSkProjects', null);
    });

    it('should emit redmine::getIssue event on redmine::getIssue socket.io event', function(done) {
        eventsManager.on('redmine::getIssue', function() {
            done();
        });
        client.emit('redmine::getIssue', null);
    });

    it('should emit syncIssues event on syncIssues socket.io event', function(done) {
        eventsManager.on('syncIssues', function() {
            done();
        });
        client.emit('syncIssues', null);
    });

    it('should emit createIssue socket.io event on createIssue event', function() {
        var issue = 'test issue';
        client.on('createIssue', function(responseIssue) {
            responseIssue.should.equal(issue);
        });
        eventsManager.emit('createIssue',issue , null);
    });

    it('should emit updateIssue socket.io event on updateIssue event', function() {
        var issue = 'test issue';
        client.on('updateIssue', function(responseIssue) {
            responseIssue.should.equal(issue);
        });
        eventsManager.emit('updateIssue', issue, null);
    });

    it('should emit log socket.io event on log event', function() {
        var log = 'test log';
        client.on('log', function(responseLog) {
            responseLog.should.equal(log);
        });
        eventsManager.emit('log', log, null);
    });

    /*
     *event / socket.io tests
     */
    it('should emit "eventToEventTest::response" event on "eventToEventTest" event', function(done) {
        eventsManager.on('eventToEventTest::response', function() {
            done();
        });
        eventsManager.emit('eventToEventTest', null);
    });

    it('should emit "eventToSocketTest::response" socket.io event on "eventToSocketTest" event', function(done) {
        client.on('eventToSocketTest::response', function() {
            done();
        });
        eventsManager.emit('eventToSocketTest', null);
    });

    it('should emit "socketToEventTest::response" socket.io event on "socketToEventTest" event', function(done) {
        eventsManager.on('socketToEventTest::response', function() {
            done();
        });
        client.emit('socketToEventTest', null);
    });

    it('should emit "socketToSocketTest::response" socket.io event on "socketToSocketTest" event', function(done) {
        client.on('socketToSocketTest::response', function() {
            done();
        });
        client.emit('socketToSocketTest', null);
    });

});
