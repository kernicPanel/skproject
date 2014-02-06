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
    commandChar = server.config.irc.commandChar,
    currentIrcNicks = {};


eventsManager.on('irc::addIrcNick', function(id, ircNick){
  //currentIrcNicks.push(ircNick);
  currentIrcNicks[ircNick] = id;
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

  ircCommand.commandParser(currentIrcNicks[from], message, function(err, response){
    if (err) {
      if (!!err.forEach) {
        err.forEach(function(errLine){
          irc.client.say(recipient, ircAPI.colors.wrap('light_red', errLine) );
        });
      }
      else {
        //irc.client.say(recipient, response);
        irc.client.say(recipient, ircAPI.colors.wrap('light_red', err) );
      }
      return;
    }
    if (!!response.forEach) {
      response.forEach(function(line){
        irc.client.say(recipient, line);
      });
    }
    else {
      irc.client.say(recipient, response);
    }
  });
};

var parseMessage = function(from, message, pm ) {
  var recipient = pm ? from : channel;

  //if(currentIrcNicks.indexOf(from) !== -1) {
  if(!!currentIrcNicks[from]) {
    parseCommand(from, message, pm);
  }
  else {
    irc.client.say(recipient, from + ": You're not allowed to run commands");
    irc.client.say(recipient, "please connect to RealTeam : http://" + server.config.irc.serverHost);
    irc.client.say(recipient, "and setup your irc nickname : http://" + server.config.irc.serverHost + '/account');
  }

  // return parsedMessage;
};

var joinMessage = function(from, message, pm ) {
  var recipient = pm ? from : channel;

  //if(currentIrcNicks.indexOf(from) !== -1) {
  if(!!currentIrcNicks[from]) {
    ircCommand.commandParser(currentIrcNicks[from], 'join', function(err, response){
      response.forEach(function(line){
        irc.client.say(recipient, line);
      });
    });
  }
};


irc.init = function() {
  eventsManager.emit('irc::getIrcUsers', function(err, ircUsers){
    console.log(ircUsers);
    ircUsers.forEach(function(ircUser){
      console.log(ircUser);
      currentIrcNicks[ircUser.irc] = ircUser.id;
    });
    console.log('currentIrcNicks', currentIrcNicks);
    /*
     *for (var i=0; i < ircNicks.length; i++) {
     *  var ircNick = ircNicks[i].irc;
     *  //if (ircNick !== null && !currentIrcNicks.hasOwnProperty(ircNick)) {
     *  if (ircNick !== null && !currentIrcNicks[ircNick]) {
     *    //currentIrcNicks.push(ircNick);
     *    //currentIrcNicks[ircNick] = id;
     *  }
     *}
     */
  });
  irc.client = new ircAPI.Client(server.config.irc.server, server.config.irc.botName, {password: server.config.irc.botPassword});
  irc.start();

  irc.client.addListener('join' + channel, function (from, message){
    joinMessage(from, message, true);
  });

  irc.client.addListener('nick', function (oldnick, newnick, channels, message){
    joinMessage(newnick, message, true);
  });

  irc.client.addListener('pm', function (from, message){
    //console.log('pm from', from, message);
    if (from === redmineBot) {
      parseBotMessage(message);
    }
    else {
      parseMessage(from, message, true);
    }
  });

  irc.client.addListener('message' + channel, function (from, message){
    //console.log('message from', from, message);
    if (message.trim().charAt(0) === commandChar) {
      parseMessage(from, message.trim().slice(1));
    }
    else if (message.trim().charAt(0) === '!') {
      irc.client.say(channel, "Vous êtes beau, m'sieur " + from);
    }

  });

  irc.client.addListener('error', function(message) {
    //console.error('error: ', message.args[1], message.args[2]);
    //console.error('error: ', message);
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
    irc.setInterval = setInterval(irc.askCurrentIssues, 60 * 1000, channel);
  };
  irc.setTimeout = setTimeout(reconnect, 1 * 1000);

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
    irc.client.say(redmineBot, server.config.irc.passPhrase);
    irc.askCurrentIssues();
  }));
};

irc.askCurrentIssues = function() {
  console.log(new Date(), '!!!!! ' + redmineBot + ' => sk !!!!!');
  irc.client.say(redmineBot, "sk");
};

irc.broadcast = function(message) {
  irc.client.say(channel, message);
}

module.exports = irc;
