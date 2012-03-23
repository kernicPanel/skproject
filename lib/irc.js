console.log("»»»»»irc load««««««");
var irc ={},
    ircAPI = require('irc');
    client = {},
    mongoose = require('mongoose');

/*
 * , var = require('toto');
 */

irc.init = function() {
    io.sockets.on('connection', function(socket){
        irc.start();
        socket.on('irc::run', function(data){

        });
        socket.on('disconnect', function(data){
            irc.stop();
        });
    });
};

irc.start = function(callback) {
    client = new irc.Client(config.irc.server, config.irc.botName, { channels: [config.irc.channel] });
    client.addListener('pm', function (from, message){
        console.log(from + ' => ME: ' + message);
    });

    callback = callback || function(){};
    callback();
};

var storeCurrentIssue = function(from, message, callback) {
    var SkUser = mongoose.model('SkUser', SkUsers);
    var db = mongoose.connect(config.mongo.host);

    callback = callback || function(){};
    callback();
};

irc.stop = function(callback) {
    callback = callback || function(){};
    callback();
};

module.exports = irc;
