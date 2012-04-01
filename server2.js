global.config = require('./lib/config');
//console.log("config : ", config);
var Webserver = require('./lib/hook').Core,
    port = (process.env.PORT || config.server.port),
    host = (process.env.HOST || config.server.host);

var server = global.server = new Webserver({
      name: 'hook.js-server',
      host: host,
      port: port,
      webroot: './public'
});

server.start();

/*
 *server.on('*', function(data){
 *    console.log(data);
 *    //server.emit('ok', data);
 *});
 */

var redmine = require('./lib/redmine.js');
redmine.init();

//var irc = require('./lib/irc.js');
//irc.init();

console.log('Listening on '+ host + ':' + port );
