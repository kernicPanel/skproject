console.log("»»»»»irc load««««««");
var irc ={},
    ircAPI = require('irc'),
    client = {},
    mongoose = require('mongoose');

/*
 * , var = require('toto');
 */

irc.init = function() {
    irc.start();
};

irc.start = function(callback) {
    client = new ircAPI.Client(config.irc.server, config.irc.botName);
    client.join(config.irc.channel, (function(){
        client.say(config.irc.channel, "Hello I'm a bot!!!");
        client.say(config.irc.redmineBot, config.irc.passPhrase);
        client.say(config.irc.redmineBot, "sk");
    }));
    client.addListener('pm', function (from, message){
        console.log(from + ' => ME: ' + message);
        storeCurrentIssue(from, message, callback);
    });

    callback = callback || function(){};
    callback();
};

var parseMess = function( message, callback ) {
    var issue = message.split( 'issues/show/' )[ 1 ];
    var arrayUser = message.split( ' ' );
    var login = arrayUser[ 0 ];
    if(login.match(',')){
        login = login.split(',')[0];
        issue = '';
    }

    if(typeof issue === 'undefined'){
        issue = '';
    }

    callback = callback || function(){};
    callback();
console.log('####### user  => ' + login);
console.log('####### issue => ' + issue);
    return {user : login, issue : issue};
};

var storeCurrentIssue = function(from, message, callback) {
    var SkUser = mongoose.model('SkUser');

    var majJSON = parseMess( message );

    SkUser.update({login:majJSON.user}, {current:majJSON.issue}, {}, callback);
    
    //callback = callback || function(){};
    //callback();
};

irc.stop = function(callback) {
    callback = callback || function(){};
    callback();
};

module.exports = irc;
