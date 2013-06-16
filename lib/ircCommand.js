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

console.log("»»»»»ircCommand load««««««".verbose);

var eventsManager = server.eventsManager,
    mongoose = require('mongoose');
    ircCommand = {};

var User = mongoose.model('User');
var Issue = mongoose.model('Issue');


ircCommand.commandParser = function(userId, commandLine, callback) {

  function sendResponse(err, res) {
    callback(err, res);
  }

  commandLine = commandLine.trim().split(' ');
  var command = commandLine.shift();
  var args = commandLine;
  var error = [];

  var response;
  if (command === 'join') {
    eventsManager.emit('ircCommand::join', userId, callback);
  }
  else if (command === 'tasks') {
    eventsManager.emit('ircCommand::tasks', userId, callback);
  }
  else if (command === 'start') {
    error = [];
    if (args.length !== 1) {
      error.push('1 argument required');
      error.push('usage : start <issue id>');
      sendResponse(error, null);
      return;
    }
    var id = args[0];
    console.log('»»»» id', id);
    eventsManager.emit('ircCommand::start', userId, id, function(err, currentIssue){
      console.log('ircCommand::start', currentIssue);
      var response = [];
      Issue.findOne({ id: currentIssue.started.issueId  }, function (err, issue) {
        //callback(null, 'start ' + issue.subject + ' ' + issue.url);
        response.push('start ' + issue.subject + ' ' + issue.url);
        if (!!currentIssue.stopped && !!currentIssue.stopped.id) {
          Issue.findOne({ id: currentIssue.stopped.id  }, function (err, issue) {
            //callback(null, 'start ' + issue.subject + ' ' + issue.url);
            response.push('stop ' + issue.subject + ' ' + issue.url + ' ' + currentIssue.stopped.pendingDuration);
            response.push('started at ' + currentIssue.stopped.startedAt);
            callback(err, response);
          });
        }
        else {
          callback(err, response);
        }
      });
      //response.push('stop ' + stoppedIssue.issueName + ' ' + stoppedIssue.issueUrl);
    });
  }
  else if (command === 'stop') {
    console.log('ircCommand stop');
    eventsManager.emit('ircCommand::stop', userId, function(err, stoppedIssue){
      console.log('ERROR FUCKER', err);
      if (err) {
        sendResponse(err);
        return;
      }
      console.log('ISSUE FUCKER', stoppedIssue);
      var time_entry = stoppedIssue.time_entry;
      Issue.findOne({ id: time_entry.issue.id  }, function (err, issue) {
        var response = [];
        response.push('stop ' + issue.subject + ' ' + issue.url + ' ' + time_entry.hours);
        response.push('comments ' + time_entry.comments);
        callback(err, response);
      });
    });
  }
  else if (command === 'addtime') {
    error = [];
    if (args.length < 2) {
      error.push('2 argument required');
      error.push('usage : addtime <issue id> <hours> [comments]');
      sendResponse(error, null);
      return;
    }
    var id = args.shift();
    var hours = args.shift();
    hours = hours.replace(',', '.');
    var reg = /(\d)+h(\d){0,2}/;
    if (hours.match(reg)) {
      var time = hours.split('h');
      console.log('time', time);
      hours = parseInt(time[0], 10);
      var minutes = parseInt(time[1], 10);
      console.log('»» hours', hours);
      console.log('»» minutes', minutes);
      hours = hours + (minutes / 60);
    }
    var comments = args.join(' ');
    console.log('»»»» id', id);
    console.log('»»»» hours', hours);
    console.log('»»»» comments', comments);
    var timeEntry = {
      id: id,
      pendingDuration: hours * 60 * 60 * 1000,
      message: comments
    };
    eventsManager.emit('ircCommand::addtime', userId, timeEntry, function(err, addtimeIssue){
      console.log('ERROR FUCKER', err);
      if (err) {
        sendResponse(err);
        return;
      }
      console.log('ISSUE FUCKER', addtimeIssue);
      var time_entry = addtimeIssue.time_entry;
      Issue.findOne({ id: time_entry.issue.id  }, function (err, issue) {
        var response = [];
        response.push('addtime ' + issue.subject + ' ' + issue.url + ' ' + time_entry.hours);
        response.push('comments ' + time_entry.comments);
        callback(err, response);
      });
    });
  }
  else if (command === 'help') {
    response = [];
    response.push('Available commands :');
    response.push('join : send join message (for test purpose)');
    response.push('tasks : list assigned tasks');
    response.push('start <issue id> : start task');
    response.push('pause : pause task (coming soon)');
    response.push('stop : stop task');
    response.push('addtime <issue id> <time> [comments] : add time entry to task');
    sendResponse(null, response);
  }
  else {
    var errors = [];
    errors.push('command unknown : ' + command);
    errors.push('with args : ' + args.join(' '));
    //callback(errors);
    //return;
    sendResponse(errors, null);
  }

  //callback(null, response);

  //console.log('command', command);
  //var parsedCommand = { command : command };
  //eventsManager.emit('irc::command', parsedCommand);
  //callback(null, "wagga " + command);
};

module.exports = ircCommand;
