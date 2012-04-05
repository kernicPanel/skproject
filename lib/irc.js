console.log("»»»»»irc load««««««");
var irc = {},
    ircAPI = require('irc'),
    cronJob = require('cron'),
    mongoose = require('mongoose');

/*
 * , var = require('toto');
 */

irc.init = function() {
    irc.ping = false;
    irc.client = new ircAPI.Client(config.irc.server, config.irc.botName);
    irc.start();
    irc.client.addListener('pm', function (from, message){
        irc.ping = true;
        console.log(from + ' => ME: ' + message);
        storeCurrentIssue(from, message);
    });
};

irc.start = function(callback) {
    irc.join(config.irc.channel);
    //Cron qui se lnce toutes les minutes
    //https://github.com/ncb000gt/node-cron
    //http://help.sap.com/saphelp_xmii120/helpdata/en/44/89a17188cc6fb5e10000000a155369/content.htm
    try {
        new cronJob.CronJob('0 * * * * *', function() {
            irc.ping = false;
            console.log('this should be printed every minuts');
            try{
                irc.client.say(config.irc.redmineBot, "!chuck");
            }catch(ex){
                console.log(ex);
            }
            if( !irc.ping ){
                irc.join(config.irc.channel);
            }
        });
    } catch(ex) {
        console.log("cron pattern not valid");
        console.log(ex);
    }

    callback = callback || function(){};
    callback();
};

irc.join = function( chan, callback ) {
    irc.client.join(chan, (function(){
        irc.client.say(config.irc.channel, "Hello I'm a bot!!!");
        irc.client.say(config.irc.redmineBot, config.irc.passPhrase);
        irc.client.say(config.irc.redmineBot, "sk");
    }));
    
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
