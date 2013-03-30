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

  eventsManager.on('timer::start', function(login, issueId, callback){
    timer.checkStart(login, issueId, function(err, data) {
      callback(err, data);
    });
  });

  eventsManager.on('timer::pause', function(login, callback){
    timer.pause(login, function(err, data) {
      callback(err, data);
    });
  });

  eventsManager.on('timer::stop', function(login, callback){
    timer.stop(login, function(err, data) {
      callback(err, data);
    });
  });

  eventsManager.on('timer::addtime', function(login, issue, callback){
    console.log("addtime", issue);
    timer.addtime(login, issue, function(err, data) {
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

timer.getCurrentIssues = function( callback ) {
  // var stream = User
  //   .find({})
  //   .where('currentIssue.id').gt(0)
  //   .select('login currentIssue')
  //   .stream();

  // stream.on('data', function (data) {
  //   var currentIssue = {
  //     login: data.login,
  //     currentIssue: {
  //       timeCounter: data.currentIssue.pendingDuration + (new Date() - data.currentIssue.startedAt),
  //       issueId: data.currentIssue.issueId,
  //       issueName: data.currentIssue.issueName,
  //       issueUrl: data.currentIssue.issueUrl,
  //       issueStatus: data.currentIssue.issueStatus,
  //       startedAt: data.currentIssue.startedAt,
  //       paused: data.currentIssue.paused,
  //       pendingDuration: data.currentIssue.pendingDuration,
  //       pendingTimeCounter: data.currentIssue.pendingDuration + (new Date() - data.currentIssue.startedAt)
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
    .where('currentIssue.id').gt(0)
    .select('login currentIssue')
    .exec(function (err, issues) {
      callback(err, issues);
    });

};

timer.checkStart = function(login, issueId, callback) {
  timer.getUserFromLogin( login, function( err, user ){
    if (!!user.currentIssue.id) {
      timer.stop(login, function(){
        timer.start(login, issueId, callback)
      });
    }
    else {
      timer.start(login, issueId, callback);
    }
  });
};

timer.start = function(login, issueId, callback) {
  console.log("timer start login : ", login);
  Issue.findOne({ id: issueId  }, function (err, issue) {
    timer.getUserFromLogin( login, function( err, user ){
      user.startIssue( issue, function( err, issue ) {
        var currentIssue = {
          login: login,
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

timer.pause = function(login, callback) {
  timer.getUserFromLogin( login, function( err, user ){
    user.pauseIssue( function( err, issue ) {
      eventsManager.emit('timer::pauseCurrentIssue', user.login);
      var currentIssue = {
        login: login,
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

timer.stop = function(login, callback) {
  console.log("timen stop login : ", login);
  timer.getUserFromLogin( login, function( err, user ){
    user.stopIssue( function( err, currentIssue ) {
      eventsManager.emit('timer::stopCurrentIssue', login);

      callback(err, currentIssue);
      // if (currentIssue.id) {
      //   timer.addtime(login, currentIssue.id, currentIssue.pendingDuration / 1000 / 60 / 60, null, callback );
      // }
    });
  });
};

timer.addtime = function addtime (login, issue, callback) {
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

  /*
   *var userRest = server.users[login].redmineRest;
   *userRest.request('POST', '/time_entries.json', params, function(err, data) {
   *  console.log("data response : ", data);
   *  callback( err, data );
   *});
   */
    callback();
};

module.exports = timer;
