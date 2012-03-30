console.log("»»»»»irc load««««««");
var irc ={},
    ircAPI = require('irc'),
    client = {},
    cronJob = require('cron').CronJob,
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

    //Cron qui se lnce toutes les minutes
    //https://github.com/ncb000gt/node-cron
    //http://help.sap.com/saphelp_xmii120/helpdata/en/44/89a17188cc6fb5e10000000a155369/content.htm
    //try {
        /*cronJob('0 * * * * *', function() {
            console.log('this should be printed every minuts');
        });*/
    //} catch(ex) {
    //    console.log("cron pattern not valid");
    //}

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
