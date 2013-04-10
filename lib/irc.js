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
    eventsManager = server.eventsManager;

irc.init = function() {
    irc.client = new ircAPI.Client(server.config.irc.server, server.config.irc.botName);
    irc.start();
    irc.client.addListener('pm', function (from, message){
        //irc.client.say('kernicPanel', message);
        // irc.ping = true;
        // console.log(new Date(), from + ' => ME: ' + message);
        // storeCurrentIssue(from, message);
        parseMessage(from, message);
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
        irc.join(server.config.irc.channel);
        irc.setInterval = setInterval(irc.join, 60 * 1000, server.config.irc.channel);
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
    console.log(new Date(), '!!!!! ' + server.config.irc.redmineBot + ' => sk !!!!!');
    irc.client.say(server.config.irc.redmineBot, server.config.irc.passPhrase);
    irc.client.say(server.config.irc.redmineBot, "sk");

    callback = callback || function(){};
    callback();
};

var parseMessage = function(from, message, callback ) {

    //console.log('message', message);
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
            startedWith : server.config.irc.redmineBot
        };
        // console.log('currentIssue : ', currentIssue);
        eventsManager.emit('irc::updateCurrentIssue', currentIssue);
    }
    else {
        var parsedMessage = { message : message };
        eventsManager.emit('irc::message', parsedMessage);
    }

    // return parsedMessage;
};

module.exports = irc;
