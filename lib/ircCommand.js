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
    ircCommand = {};


ircCommand.commandParser = function(from, commandLine, callback) {

  function sendResponse(err, res) {
    callback(err, res);
  }

  commandLine = commandLine.trim().split(' ');
  var command = commandLine.shift();
  var args = commandLine;

  var response;
  if (command === 'join') {
    eventsManager.emit('irc::command', from, command, args, sendResponse);
  }
  else if (command === 'tasks') {
    eventsManager.emit('irc::command', from, command, args, sendResponse);
  }
  else if (command === 'longtasks') {
    eventsManager.emit('irc::command', from, command, args, sendResponse);
  }
  else if (command === 'help') {
    response = [];
    response.push('Available commands :');
    response.push('join : send join message (for test purpose)');
    response.push('tasks : list assigned tasks');
    response.push('start <issue id> : start task (coming soon)');
    response.push('pause : pause task (coming soon)');
    response.push('stop : stop task (coming soon)');
    response.push('addtime <issue id> <time> : add time intry to task (coming soon)');
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
