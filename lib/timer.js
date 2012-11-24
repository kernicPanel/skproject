/*

Copyright (c) 2012 Nicolas Clerc <kernicpanel@nclerc.fr>

This file is part of redLive.

redLive is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

redLive is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with redLive.  If not, see <http://www.gnu.org/licenses/>.

*/

console.log("»»»»»timer load««««««");
var timer ={},
  mongoose = require('mongoose');
var eventsManager = server.eventsManager;

var TeamMember = mongoose.model('TeamMember');
var AppUser = mongoose.model('AppUser');
var Issue = mongoose.model('Issue');

timer.init = function() {
  timer.events();
};

timer.events = function() {
  eventsManager.on('timer::start', function(username, issueId, callback){
    timer.start(username, issueId, function(err, data) {
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

  eventsManager.on('timer::addtime', function(username, callback){
    timer.addtime(username, function(err, data) {
      callback(err, data);
    });
  });

  eventsManager.on('timer::updateCurrentIssue', function(currentIssue, callback){
    // console.log("timer::currentIssue : ", currentIssue);
    storeCurrentIssue(currentIssue, function(err, data) {
      // callback(err, data);
    });
  });
};

var storeCurrentIssue = function(currentIssue, callback) {
  // if (currentIssue.login === 'nicolas.clerc') {
  //   eventsManager.emit('log', currentIssue);
  // }
  if (!!currentIssue.login) {
    AppUser.findOne({username:currentIssue.login}, {currentTask: 1}, function (err, appUser) {
      // eventsManager.emit('log', appUser);
      if (!appUser || !appUser.currentTask.id) {
        TeamMember.find({login:currentIssue.login}).update({currentTask: currentIssue}, callback);
        // eventsManager.emit('log', currentIssue);
        eventsManager.emit('timer::currentIssueUpdated', currentIssue);

      }
    });
  }
};

timer.getUserFromId = function getUserFromId ( id, callback ) {
  AppUser.findOne( {id: id}, function (err, appUser) {
    callback(err, appUser);
  });
};

timer.getUserFromUsername = function getUserFromUsername ( username, callback ) {
  console.log(" username : ", username);
  AppUser.findOne( {username: username}, function (err, appUser) {
    callback(err, appUser);
  });
};

timer.start = function(username, issueId, callback) {
  console.log("timer start username : ", username);
  Issue.findOne({ id: issueId  }, function (err, issue) {
    var currentIssue = {
      issueId: issue.id.toString,
      issueName: issue.subject,
      issueStatus: "en cours",
      issueTime: "0",
      // issueUrl: " https://" + server.config.redmine.host + "/issues/show/" + issue.id,
      issueUrl: issue.url,
      login: username,
      startedWith: server.config.server.name,
      startedAt : new Date()
    };
    storeCurrentIssue(currentIssue, function(err, data) {
      // callback(err, data);
    });
  });
  timer.getUserFromUsername( username, function( err, appUser ){
    appUser.startIssue( issueId, function( err, duration ) {
      callback( err, duration );
    });
  });
};

timer.pause = function(username, callback) {
  timer.getUserFromUsername( username, function( err, appUser ){
    eventsManager.emit('log', appUser);
    appUser.pauseIssue( function( err, duration ) {
      callback( err, duration );
    });
  });
};

timer.stop = function(username, callback) {
  console.log("redmine stop username : ", username);
  timer.getUserFromUsername( username, function( err, appUser ){
    appUser.stopIssue( function( err, currentIssue ) {
      eventsManager.emit('log', appUser.currentTask);
      if (currentIssue.id) {
        timer.addtime(username, currentIssue.id, currentIssue.pendingDuration / 1000 / 60, null, callback );
      };
    });
  });
};

timer.addtime = function addtime (username, issueId, hours, comments, callback) {
  var params = {
    time_entry:{
      issue_id: issueId,
      hours: hours,
      comments: comments
    }
  };

  eventsManager.emit('log', username);
  eventsManager.emit('log', params);

  // var userRest = server.users[username].redmineRest;
  // userRest.request('POST', '/time_entries.json', params, function(err, data) {
  //   console.log("data response : ", data);
  //   callback( err, data );
  // });
}

module.exports = timer;
