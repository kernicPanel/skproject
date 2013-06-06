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

console.log("»»»»»irc load««««««".verbose);
var irc = {},
    ircAPI = require('irc'),
    ircCommand = require('./ircCommand'),
    eventsManager = server.eventsManager,
    redmineBot = server.config.irc.redmineBot,
    channel = server.config.irc.channel,
    currentIrcNicks = [];


eventsManager.on('irc::addIrcNick', function(ircNick){
  currentIrcNicks.push(ircNick);
});

var parseBotMessage = function (message){
  if (message.match(' : ')) {
    var messageSplit = message.split( ' : ' );
    var login = messageSplit[0];

    var issueId = 'Aucune';
    var issueStatus = '';
    var issueTime = '';
    var issueName = '';
    var issueUrl = '';

    if (messageSplit[1].match('#')) {
      issueId = messageSplit[1].split('#')[1].split('[')[0];
      issueStatus = messageSplit[1].split('[')[1].split(']')[0];
      issueTime = messageSplit[1].split('(')[1].split(')')[0];
    }

    if (messageSplit.length > 2) {
      issueName = messageSplit[2].split('(!!) =>')[0];
      issueUrl = messageSplit[2].split('(!!) =>')[1];
    }

    var currentIssue = {
      login : login,
      issueId : issueId,
      issueStatus : issueStatus,
      issueTime : issueTime,
      issueName : issueName,
      issueUrl : issueUrl,
      startedWith : redmineBot
    };
    // console.log('currentIssue : ', currentIssue);
    eventsManager.emit('irc::updateCurrentIssue', currentIssue);
  }
};

var parseCommand = function(from, message, pm ) {
  pm = pm || false;
  var recipient = pm ? from : channel;

  ircCommand.commandParser(from, message, function(err, res){
    irc.client.say(recipient, res);
  });
};

var parseMessage = function(from, message, pm ) {
  var recipient = pm ? from : channel;

  if(currentIrcNicks.indexOf(from) !== -1) {
    parseCommand(from, message, pm);
  }
  else {
    irc.client.say(recipient, from + ": You're not allowed to run commands");
    irc.client.say(recipient, "please connect to RealTeam : http://" + server.config.server.host);
    irc.client.say(recipient, "and setup your irc nickname : http://" + server.config.server.host + '/account');
  }

  // return parsedMessage;
};


irc.init = function() {
  eventsManager.emit('irc::getIrcNicks', function(err, ircNicks){
    for (var i=0; i < ircNicks.length; i++) {
      var ircNick = ircNicks[i].irc;
      if (ircNick !== null && !currentIrcNicks.hasOwnProperty(ircNick)) {
        currentIrcNicks.push(ircNick);
      }
    }
  });
  irc.client = new ircAPI.Client(server.config.irc.server, server.config.irc.botName);
  irc.start();

  irc.client.addListener('pm', function (from, message){
    parseMessage(from, message, true);
  });

  irc.client.addListener('message' + channel, function (from, message){
    if (message.trim().charAt(0) === '!') {
      parseMessage(from, message);
    }
  });

  irc.client.addListener('error', function(message) {
    console.error('error: ', message.args[1], message.args[2]);
    console.error('error: ', message);
  });

  eventsManager.on('startIRC', function(){
    irc.start();
  });

  eventsManager.on('stopIRC', function(){
    irc.stop();
  });
};

irc.start = function(callback) {
  console.log('irc start'.error);
  var reconnect = function() {
    console.log(new Date(), '!!! reconnect !!!');
    irc.join(channel);
    irc.setInterval = setInterval(irc.join, 60 * 1000, channel);
  };
  irc.setTimeout = setTimeout(reconnect, 10 * 1000);

  callback = callback || function(){};
  callback();
};

irc.stop = function(callback) {
  console.log('irc stop'.error);
  if (!!irc.setInterval) {
    clearInterval(irc.setInterval);
  }
  console.log("irc.setTimeout : ", irc.setTimeout);
  clearTimeout(irc.setTimeout);
};

irc.join = function( chan, callback ) {
  irc.client.join(chan, (function(){
    console.log(new Date(), '!!!!! ' + redmineBot + ' => sk !!!!!');
    irc.client.say(redmineBot, server.config.irc.passPhrase);
    irc.client.say(redmineBot, "sk");

    callback = callback || function(){};
    callback();
  }));
};

module.exports = irc;
