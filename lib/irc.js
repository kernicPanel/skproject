console.log("»»»»»irc load««««««");
var irc = {},
    ircAPI = require('irc'),
    cronJob = require('cron'),
    mongoose = require('mongoose'),
    push = global.push || false;

irc.init = function() {
    irc.client = new ircAPI.Client(config.irc.server, config.irc.botName);
    irc.start();
    irc.client.addListener('pm', function (from, message){
        //irc.client.say('kernicPanel', message);
        irc.ping = true;
        console.log(new Date(), from + ' => ME: ' + message);
        storeCurrentIssue(from, message);
    });
};

irc.start = function(callback) {
    console.log('irc start');
    var reconnect = function() {
	console.log(new Date(), '!!! reconnect !!!');
        irc.join(config.irc.channel);
        setInterval(irc.join, 60 * 1000, config.irc.channel);
    };
    setTimeout(reconnect, 10 * 1000);

    callback = callback || function(){};
    callback();
};

irc.join = function( chan, callback ) {
    //irc.client.join(chan, (function(){
        console.log(new Date(), '!!!!! ' + config.irc.nedmineBot + ' => sk !!!!!');
        irc.client.say(config.irc.redmineBot, config.irc.passPhrase);
        irc.client.say(config.irc.redmineBot, "sk");
    //}));
    
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
/*
 *    var issue = message.split( 'issues/show/' )[ 1 ];
 *    var arrayUser = message.split( ' ' );
 *    var login = arrayUser[ 0 ];
 *    if(login.match(',')){
 *        login = login.split(',')[0];
 *        issue = '';
 *    }
 *
 *    if(typeof issue === 'undefined' || issue === ''){
 *        issue = 'Aucune';
 *    }
 *
 *    callback = callback || function(){};
 *    callback();
 * //console.log('####### user  => ' + login);
 * //console.log('####### issue => ' + issue);
 *    return {user : login, issue : issue};
 */
};

var storeCurrentIssue = function(from, message, callback) {
    var SkUser = mongoose.model('SkUser');

    var majJSON = parseMess( message );

    //SkUser.update({login:majJSON.user}, {current:majJSON.issue}, {}, callback);
    //SkUser.update({login:majJSON.user}, {current:majJSON.issue});
    //skUser.save();
    if (!!majJSON.user) {
        SkUser.find({login:majJSON.login}).update({current:majJSON.issueId}, callback);
    }
    
    //console.log('update emit');

    /*
     *io.sockets.on('connection', function(socket){
     *    push = true;
     *});
     */
    var socket = global.socket || false;
    if (socket) {
        //socket.emit('log', majJSON);
        socket.emit('updateCurrentIssue::response', majJSON);
        /*
         *SkUser.findOne({login:majJSON.user}, ['id'], function (err, doc) {
         *    if (doc) {
         *        socket.emit('log', majJSON);
         *        var userIssue = {id: doc.id, issue: majJSON.issue};
         *        socket.emit('updateCurrentIssue::response', majJSON);
         *    }
         *});
         */

    }
    //io.sockets.on('connection', function(socket){
    //
    //});
    //callback = callback || function(){};
    //callback();
};

irc.stop = function(callback) {
    callback = callback || function(){};
    callback();
};

module.exports = irc;
