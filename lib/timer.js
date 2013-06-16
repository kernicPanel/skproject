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

console.log("»»»»»timer load««««««");
var timer ={},
  mongoose = require('mongoose');
var eventsManager = server.eventsManager;

// var TeamMember = mongoose.model('TeamMember');
var User = mongoose.model('User');
var Issue = mongoose.model('Issue');

timer.init = function() {
  timer.events();
};

timer.events = function() {

  eventsManager.on('timer::getCurrentIssues', function(callback){
    timer.getCurrentIssues( function(err, issues) {
      callback(err, issues);
    });
  });

  eventsManager.on('timer::start', function(userId, issueId, callback){
    timer.checkStart(userId, issueId, function(err, data) {
      callback(err, data);
    });
  });

  eventsManager.on('timer::ircStart', function(userId, issueId, callback){
    timer.ircCheckStart(userId, issueId, function(err, data) {
      callback(err, data);
    });
  });

  eventsManager.on('timer::pause', function(userId, callback){
    timer.pause(userId, function(err, data) {
      callback(err, data);
    });
  });

  eventsManager.on('timer::stop', function(userId, callback){
    timer.stop(userId, function(err, data) {
      callback(err, data);
    });
  });

  eventsManager.on('timer::ircStop', function(userId, callback){
    timer.ircStop(userId, function(err, data) {
      callback(err, data);
    });
  });

  eventsManager.on('timer::ircAddtime', function(userId, timeEntry, callback){
    timer.ircAddtime(userId, timeEntry, function(err, data) {
      callback(err, data);
    });
  });

  eventsManager.on('timer::addtime', function(userId, issue, callback){
    console.log("addtime", issue);
    timer.addtime(userId, issue, function(err, data) {
      callback(err, data);
    });
  });
};

timer.getUserFromId = function getUserFromId ( id, callback ) {
  User.findOne( {id: id}, function (err, user) {
    callback(err, user);
  });
};

timer.getUserFromLogin = function getUserFromLogin ( login, callback ) {
  console.log(" login : ", login);
  User.findOne( {login: login}, function (err, user) {
    callback(err, user);
  });
};

timer.getUserFromIrcNick = function getUserFromIrcNick ( ircNick, callback ) {
  console.log(" ircNick : ", ircNick);
  User.findOne( {irc: ircNick}, function (err, user) {
    callback(err, user);
  });
};

timer.getCurrentIssues = function( callback ) {
  var query = User
    .find({})
    .where('currentIssue.id').gt(0)
    .select('login currentIssue')
    .exec(function (err, issues) {
      callback(err, issues);
    });

};

timer.checkStart = function(userId, issueId, callback) {
  timer.getUserFromId( userId, function( err, user ){
    if (!!user.currentIssue.id) {
      timer.stop(userId, function(){
        timer.start(userId, issueId, callback);
      });
    }
    else {
      timer.start(userId, issueId, callback);
    }
  });
};

timer.ircCheckStart = function(userId, issueId, callback) {
  timer.getUserFromId( userId, function( err, user ){
    if (!!user.currentIssue.id) {
      timer.ircStop(userId, function(err, stoppedIssue){
          console.log('stoppedIssue', stoppedIssue);
          var stopped = {
            id: stoppedIssue.id,
            startedAt: stoppedIssue.startedAt,
            pendingDuration: stoppedIssue.pendingDuration,
            issueTime: stoppedIssue.issueTime
          };
        timer.start(userId, issueId, function(err, currentIssue){
          console.log('stoppedIssue', stoppedIssue);
          console.log('stopped', stopped);
          console.log('currentIssue', currentIssue);
          var response = {};
          response.stopped = stopped;
          response.started = currentIssue;
          callback(err, response);
        });
      });
    }
    else {
      timer.start(userId, issueId, function(err, currentIssue){
        console.log('currentIssue', currentIssue);
        eventsManager.emit('issueStarted', currentIssue);
        callback(err, {started: currentIssue});
      });
    }
  });
};

timer.ircStop = function(userId, callback) {
  timer.getUserFromId( userId, function( err, user ){
    user.stopIssue( function( err, currentIssue ) {

      if (currentIssue.id) {
        eventsManager.emit('timer::issueStopped', user.id);
        timer.ircAddtime(userId, currentIssue, callback);
      }
      else {
        callback('no issue started');
      }
    });
  });
};

timer.ircAddtime = function ircAddtime (userId, issue, callback) {
  console.log('ircAddtime issue', issue);
  var issueId = issue.id;
  //var issueHours = issue.hours !== '' ? parseInt(issue.hours, 10) : 0;
  //var issueMinutes = issue.minutes !== '' ? parseInt(issue.minutes, 10) / 60 : 0;
  //var hours = issueHours + issueMinutes;
  var hours = issue.pendingDuration / 1000 / 60 / 60;
  var comments = issue.message || '';
  var params = {
    time_entry:{
      issue_id: issueId,
      hours: hours,
      comments: comments
    }
  };

  console.log('ircAddtime params', params);

  timer.getUserFromId( userId, function( err, user ){
    var userRest = server.users[user.login].redmineRest;
    userRest.request('POST', '/time_entries.json', params, function(err, data) {
      console.log("ircAddtime data error : ", err ? err.message:err);
      console.log("ircAddtime data response : ", data);
      callback( err, data );
    });
    //callback();
  });
};
timer.start = function(userId, issueId, callback) {
  //console.log("timer start userId : ", userId);
  Issue.findOne({ id: issueId  }, function (err, issue) {
    if (!issue) {
      callback( new Error('issue not found'));
      //callback('issue not found');
      return;
    }
    timer.getUserFromId( userId, function( err, user ){
      user.startIssue( issue, function( err, issue ) {
        //console.log("issue started", issue);
        var currentIssue = {
          login: user.login,
          userId: user.id,
          timeCounter: issue.pendingDuration + (new Date() - issue.startedAt),
          issueId: issue.id,
          issueName: issue.issueName,
          issueUrl: issue.issueUrl,
          issueStatus: issue.issueStatus,
          startedAt: issue.startedAt,
          paused: issue.paused,
          pendingDuration: issue.pendingDuration
        };
        //console.log("issue started", currentIssue);
        callback( err, currentIssue );
      });
    });
  });
};

timer.pause = function(userId, callback) {
  timer.getUserFromId( userId, function( err, user ){
    user.pauseIssue( function( err, issue ) {
      eventsManager.emit('timer::pauseCurrentIssue', user.login);
      var currentIssue = {
        login: user.login,
        userId: user.id,
        timeCounter: issue.pendingDuration + (new Date() - issue.startedAt),
        issueId: issue.issueId,
        issueName: issue.issueName,
        issueUrl: issue.issueUrl,
        issueStatus: issue.issueStatus,
        startedAt: issue.startedAt,
        paused: issue.paused,
        pendingDuration: issue.pendingDuration,
        pendingTimeCounter: issue.pendingDuration + (new Date() - issue.startedAt)
      };
      callback( err, currentIssue );
    });
  });
};

timer.stop = function(userId, callback) {
  //console.log("timen stop userId : ", userId);
  timer.getUserFromId( userId, function( err, user ){
    user.stopIssue( function( err, currentIssue ) {
      eventsManager.emit('timer::stopCurrentIssue', user.id);

      callback(err, currentIssue);
      // if (currentIssue.id) {
      //   timer.addtime(login, currentIssue.id, currentIssue.pendingDuration / 1000 / 60 / 60, null, callback );
      // }
    });
  });
};

timer.addtime = function addtime (userId, issue, callback) {
  eventsManager.emit('log', issue);
  var issueId = issue.id;
  var issueHours = issue.hours !== '' ? parseInt(issue.hours, 10) : 0;
  var issueMinutes = issue.minutes !== '' ? parseInt(issue.minutes, 10) / 60 : 0;
  var hours = issueHours + issueMinutes;
  var comments = issue.message || '';
  var params = {
    time_entry:{
      issue_id: issueId,
      hours: hours,
      comments: comments
    }
  };

  // eventsManager.emit('log', login);
  eventsManager.emit('log', params);

  timer.getUserFromId( userId, function( err, user ){
    var userRest = server.users[user.login].redmineRest;
    userRest.request('POST', '/time_entries.json', params, function(err, data) {
      //console.log("data error : ", err);
      console.log("addTime data error : ", err ? err.message:err);
      console.log("addTime data response : ", data);
      callback( err, data );
    });
    callback();
  });
};

module.exports = timer;
