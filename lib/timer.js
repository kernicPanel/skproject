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

  eventsManager.on('timer::start', function(username, issueId, callback){
    timer.checkStart(username, issueId, function(err, data) {
      callback(err, data);
    });
  });

  eventsManager.on('timer::pause', function(username, callback){
    timer.pause(username, function(err, data) {
      callback(err, data);
    });
  });

  eventsManager.on('timer::stop', function(username, callback){
    timer.stop(username, function(err, data) {
      callback(err, data);
    });
  });

  eventsManager.on('timer::addtime', function(username, issue, callback){
    console.log("addtime", issue);
    timer.addtime(username, issue, function(err, data) {
      callback(err, data);
    });
  });
};

timer.getUserFromId = function getUserFromId ( id, callback ) {
  User.findOne( {id: id}, function (err, user) {
    callback(err, user);
  });
};

timer.getUserFromUsername = function getUserFromUsername ( username, callback ) {
  console.log(" username : ", username);
  User.findOne( {username: username}, function (err, user) {
    callback(err, user);
  });
};

timer.getCurrentIssues = function( callback ) {
  // var stream = User
  //   .find({})
  //   .where('currentTask.id').gt(0)
  //   .select('username currentTask')
  //   .stream();

  // stream.on('data', function (data) {
  //   var currentIssue = {
  //     username: data.username,
  //     currentTask: {
  //       timeCounter: data.currentTask.pendingDuration + (new Date() - data.currentTask.startedAt),
  //       issueId: data.currentTask.issueId,
  //       issueName: data.currentTask.issueName,
  //       issueUrl: data.currentTask.issueUrl,
  //       issueStatus: data.currentTask.issueStatus,
  //       startedAt: data.currentTask.startedAt,
  //       paused: data.currentTask.paused,
  //       pendingDuration: data.currentTask.pendingDuration,
  //       pendingTimeCounter: data.currentTask.pendingDuration + (new Date() - data.currentTask.startedAt)
  //     }
  //   };
  //   // eventsManager.emit('log', data);
  //   eventsManager.emit('timer::getCurrentIssues::response', currentIssue);
  // });

  // stream.on('error', function (err) {
  //   // handle the error
  // });

  // stream.on('close', function () {
  //   // the stream is closed
  // });

  var query = User
    .find({})
    .where('currentTask.id').gt(0)
    .select('username currentTask')
    .exec(function (err, issues) {
      callback(err, issues);
    });

};

timer.checkStart = function(username, issueId, callback) {
  timer.getUserFromUsername( username, function( err, user ){
    if (!!user.currentTask.id) {
      timer.stop(username, function(){
        timer.start(username, issueId, callback)
      });
    }
    else {
      timer.start(username, issueId, callback);
    }
  });
};

timer.start = function(username, issueId, callback) {
  console.log("timer start username : ", username);
  Issue.findOne({ id: issueId  }, function (err, issue) {
    timer.getUserFromUsername( username, function( err, user ){
      user.startIssue( issue, function( err, issue ) {
        var currentIssue = {
          login: username,
          timeCounter: issue.pendingDuration + (new Date() - issue.startedAt),
          issueId: issue.issueId,
          issueName: issue.issueName,
          issueUrl: issue.issueUrl,
          issueStatus: issue.issueStatus,
          startedAt: issue.startedAt,
          paused: issue.paused,
          pendingDuration: issue.pendingDuration
        };
        callback( err, currentIssue );
      });
    });
  });
};

timer.pause = function(username, callback) {
  timer.getUserFromUsername( username, function( err, user ){
    user.pauseIssue( function( err, issue ) {
      eventsManager.emit('timer::pauseCurrentIssue', user.login);
      var currentIssue = {
        login: username,
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

timer.stop = function(username, callback) {
  console.log("timen stop username : ", username);
  timer.getUserFromUsername( username, function( err, user ){
    user.stopIssue( function( err, currentTask ) {
      eventsManager.emit('timer::stopCurrentIssue', username);

      callback(err, currentTask);
      // if (currentTask.id) {
      //   timer.addtime(username, currentTask.id, currentTask.pendingDuration / 1000 / 60 / 60, null, callback );
      // }
    });
  });
};

timer.addtime = function addtime (username, issue, callback) {
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

  // eventsManager.emit('log', username);
  eventsManager.emit('log', params);

  /*
   *var userRest = server.users[username].redmineRest;
   *userRest.request('POST', '/time_entries.json', params, function(err, data) {
   *  console.log("data response : ", data);
   *  callback( err, data );
   *});
   */
};

module.exports = timer;
