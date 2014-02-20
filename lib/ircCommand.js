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

var moment = require('moment');

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
  if (command === 'reboot') {
    //eventsManager.emit('ircCommand::join', userId, callback);
    User.findOne({id: userId}, 'login firstname lastname', function (err, user) {
      if (server.config.server.admin.indexOf(user.login) > -1 ) {
        var response = [];
        response.push("…reboot…");
        callback(err, response);
        process.exit(0);
      }
      else {
        var response = [];
        response.push('Sorry ' + user.firstname + ' ' + user.lastname);
        response.push("You're not allowed to do that…");
        callback(err, response);
      }
    });
  }
  else if (command === 'join') {
    //eventsManager.emit('ircCommand::join', userId, callback);
    User.findOne({id: userId}, 'id firstname lastname issue_ids', function (err, user) {
      var response = [];
      response.push('Hello ' + user.firstname + ' ' + user.lastname);
      response.push('http://' + server.config.irc.serverHost + '/#/users/' + user.id);
      response.push(user.issue_ids.length + ' taches redmine assignées');
      console.log('response', response);
      callback(err, response);
    });
  }
  else if (command === 'invite') {
    var response = [];
    response.push('Salut, bientôt Internethux ne sera plus…');
    response.push('Pour ne pas avoir de problemes ni de regret, je vous propose de passer tout de suite à RealTeam.');
    response.push("Même si Internethux est toujours dispo avec le préfixe $, merci d'utiliser le nouveau bot et de me faire remonter les bugs que vous rencontrez");
    response.push("J'espère que ça vous plaira ;)");
    response.push(" ");
    response.push("Pour démarrer avec le bot, copiez votre 'Clé d'accès API' redmine :");
    response.push("https://" + server.config.redmine.host + "/my/account");
    response.push("Et (re)créez votre compte sur RealTeam :");
    response.push('http://' + server.config.irc.serverHost);
    response.push(" ");
    response.push("Pour les bugs RealTeam, merci de les décrire ici :");
    response.push('http://' + server.config.gitlab.url +'/nc/realteam/issues');
    response.push(" ");
    response.push("    kernicPanel");
    response.push(" ");
    response.push(" ");
    response.push("------------------------------------------------");
    response.push('Redmine : http://' + server.config.redmine.host);
    response.push('Gitlab : http://' + server.config.gitlab.url);
    response.push('RealTeam : http://' + server.config.irc.serverHost);
    response.push("------------------------------------------------");
    console.log('response', response);
    callback(null, response);
  }
  else if (command === 'tasks') {
    eventsManager.emit('ircCommand::tasks', userId, callback);
  }
  else if (command === 'task') {
    eventsManager.emit('ircCommand::task', userId, callback);
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
      //currentIssue || callback('error');
      //if (!!currentIssue) {
        //callback('error');
        //return;
      //}
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
  else if (command === 'pause') {
    console.log('ircCommand pause');
    eventsManager.emit('ircCommand::pause', userId, function(err, pausedIssue){
      console.log('ERROR FUCKER', err);
      if (err) {
        sendResponse(err);
        return;
      }
      console.log('ISSUE FUCKER', pausedIssue);
      Issue.findOne({ id: pausedIssue.issueId  }, function (err, issue) {
        var response = [];
        response.push('pause ' + issue.subject + ' ' + issue.url + ' ' + moment(pausedIssue.pendingDuration).zone(0).format('H:mm:ss'));
        response.push('status ' + pausedIssue.issueStatus);
        callback(err, response);
      });
    });
  }
  else if (command === 'stop') {
    console.log('ircCommand stop');
    eventsManager.emit('ircCommand::stop', userId, function(err, stoppedIssue){
      if (!!stoppedIssue) {
        console.log('ERROR FUCKER', err);
        //console.log('PARAMS FUCKER', stoppedIssue.fullHours);
        var time_entry = stoppedIssue.time_entry;
        var id;
        var error = !!err;
        if (error) {
          console.log(stoppedIssue);
          sendResponse("ERROR : " + err);
          id = time_entry.issue_id;
        }
        else {
          id = time_entry.issue.id;
        }
        console.log('ISSUE FUCKER', stoppedIssue);
        Issue.findOne({ id: id  }, function (err, issue) {
          var response = [];
          if (error) {
            sendResponse("Please add your time entry here : ");
            response.push(issue.url + '/time_entries/new');
            response.push('You spent ' + time_entry.hours + ' hours on this task');
            //response.push('Your comment was : "' + time_entry.comments + '"');
          }
          else {
            //console.log('stoppedIssue', stoppedIssue);
            //console.log('time_entry', time_entry);
            var duration = moment( Math.round(time_entry.fullHours*60*60*1000)).zone(0).format('H:mm:ss');
            response.push('stop ' + issue.subject + ' ' + issue.url + ' ' + duration);
            //dur = moment.duration(0.05, 'hours'); dur.hours()+':'+dur.minutes()+':'+dur.seconds();
            //response.push('comments ' + time_entry.comments);
          }
          callback(err, response);
        });
      }
      else {
        callback('No issue started :(', null);
      }
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
      var error = !!err;
      if (error) {
        sendResponse("ERROR : " + err);
        //id = time_entry.issue_id;
        //console.log('ERROR FUCKER', err);
        //return;
      }
      else {
        //id = time_entry.issue.id;
      }
      console.log('ISSUE FUCKER', addtimeIssue);
      var time_entry = addtimeIssue.time_entry;
      Issue.findOne({ id: id  }, function (err, issue) {
        var response = [];
        if (error) {
          sendResponse("Please add your time entry here : ");
          response.push(issue.url + '/time_entries/new');
          response.push('You spent ' + time_entry.hours + ' hours on this task');
          response.push('Your comment was : "' + time_entry.comments + '"');
        }
        else {
          response.push('stop ' + issue.subject + ' ' + issue.url + ' ' + time_entry.hours);
          response.push('comments ' + time_entry.comments);
        }
        //var response = [];
        //response.push('addtime ' + issue.subject + ' ' + issue.url + ' ' + time_entry.hours);
        //response.push('comments ' + time_entry.comments);
        callback(err, response);
      });
    });
  }
  else if (command === 'help') {
    response = [];
    response.push('Available commands :');
    response.push('join : send join message (for test purpose)');
    response.push('reboot : reboot ' + server.config.irc.botName + ' (admin only)');
    response.push('task : display started task');
    response.push('tasks : list assigned tasks');
    response.push('start <issue id> : start task');
    response.push('pause : pause task');
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
