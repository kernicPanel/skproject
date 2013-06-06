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

  commandLine = commandLine.split(' ');
  var command = commandLine.pop();
  var args = commandLine;

  var response;
  if (command === 'join') {
    //callback(null, "hello " + from);
    response = "hello " + from;
  }
  else if (command === 'tasks') {
    response = [];
    response.push('task 1');
    response.push('task 2');
    response.push('task 3');
  }
  else {
    var errors = [];
    errors.push('command unknown : ' + command);
    errors.push('with args : ' + args.join(' '));
    callback(errors);
    return;
  }

  callback(null, response);

  //console.log('command', command);
  //var parsedCommand = { command : command };
  //eventsManager.emit('irc::command', parsedCommand);
  //callback(null, "wagga " + command);
};

module.exports = ircCommand;
