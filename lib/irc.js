console.log("»»»»»irc load««««««");
var irc = {},
    ircAPI = require('irc'),
    cronJob = require('cron'),
    mongoose = require('mongoose'),
    push = global.push || false;

/*
 * , var = require('toto');
 */

irc.init = function() {
    irc.ping = false;
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
    //irc.join(config.irc.channel);
    //Cron qui se lnce toutes les minutes
    //https://github.com/ncb000gt/node-cron
    //http://help.sap.com/saphelp_xmii120/helpdata/en/44/89a17188cc6fb5e10000000a155369/content.htm
    try {
        console.log('try');
        new cronJob.CronJob('0 * * * * *', function() {
            irc.ping = false;
            console.log(new Date(), '=====> this should be printed every minuts');
            try{
                //irc.client.say(config.irc.redmineBot, "!chuck");
                irc.client.say(config.irc.redmineBot, "sk");
            }catch(ex){
                console.log(ex);
                //irc.join(config.irc.channel);
            }
            //setTimeout(reconnect, 60 * 1000);
        });
    } catch(ex) {
        console.log("cron pattern not valid");
        console.log(ex);
    }

    var reconnect = function() {
	console.log(new Date(), '!!! reconnect !!!');
        if( !irc.ping ){
            irc.join(config.irc.channel);
        }
    };

    callback = callback || function(){};
    callback();
};

irc.join = function( chan, callback ) {
    console.log(new Date(), '!! join !!');
    //irc.client.join(chan, (function(){
        console.log(new Date(), '!!!!! joined => sk !!!!!');
        //irc.client.say(config.irc.channel, "Hello I'm a bot!!!");
        irc.client.say(config.irc.redmineBot, config.irc.passPhrase);
        irc.client.say(config.irc.redmineBot, "sk");
    //}));
    
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

    if(typeof issue === 'undefined' || issue === ''){
        issue = 'Aucune';
    }

    callback = callback || function(){};
    callback();
//console.log('####### user  => ' + login);
//console.log('####### issue => ' + issue);
    return {user : login, issue : issue};
};

var storeCurrentIssue = function(from, message, callback) {
    var SkUser = mongoose.model('SkUser');

    var majJSON = parseMess( message );

    //SkUser.update({login:majJSON.user}, {current:majJSON.issue}, {}, callback);
    //SkUser.update({login:majJSON.user}, {current:majJSON.issue});
    //skUser.save();
    SkUser.find({login:majJSON.user}).update({current:majJSON.issue}, callback);
    
    //console.log('update emit');

    /*
     *io.sockets.on('connection', function(socket){
     *    push = true;
     *});
     */
    var socket = global.socket || false;
    if (socket) {
        socket.emit('log', majJSON);
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
