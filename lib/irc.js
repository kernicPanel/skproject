console.log("»»»»»irc load««««««");
var irc = {},
    ircAPI = require('irc'),
    cronJob = require('cron'),
    mongoose = require('mongoose'),
    push = global.push || false;
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();

irc.init = function() {
    irc.client = new ircAPI.Client(server.config.irc.server, server.config.irc.botName);
    irc.start();
    irc.client.addListener('pm', function (from, message){
        //irc.client.say('kernicPanel', message);
        irc.ping = true;
        console.log(new Date(), from + ' => ME: ' + message);
        storeCurrentIssue(from, message);
    });
};

irc.io = function(socket) {
    emitter.on('updateCurrentIssue::response', function(majJSON){
        socket.emit('updateCurrentIssue::response', majJSON);
    });
};

irc.start = function(callback) {
    console.log('irc start');
    var reconnect = function() {
        console.log(new Date(), '!!! reconnect !!!');
        irc.join(server.config.irc.channel);
        setInterval(irc.join, 60 * 1000, server.config.irc.channel);
    };
    setTimeout(reconnect, 10 * 1000);

    callback = callback || function(){};
    callback();
};

irc.join = function( chan, callback ) {
    console.log(new Date(), '!!!!! ' + server.config.irc.redmineBot + ' => sk !!!!!');
    irc.client.say(server.config.irc.redmineBot, server.config.irc.passPhrase);
    irc.client.say(server.config.irc.redmineBot, "sk");

    callback = callback || function(){};
    callback();
};

var parseMess = function( message, callback ) {

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

        return {
            login : login,
            issueId : issueId,
            issueStatus : issueStatus,
            issueTime : issueTime,
            issueName : issueName,
            issueUrl : issueUrl
        };
    }
    else {
        return { message : message };
    }
};

var storeCurrentIssue = function(from, message, callback) {
    var SkUser = mongoose.model('SkUser');

    var majJSON = parseMess( message );
    //console.log("majJSON : ", majJSON);
    if (!!majJSON.login) {
        SkUser.find({login:majJSON.login}).update(majJSON, callback);
        emitter.emit('updateCurrentIssue::response', majJSON);
    }
};

irc.stop = function(callback) {
    callback = callback || function(){};
    callback();
};

module.exports = irc;
