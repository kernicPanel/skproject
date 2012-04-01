console.log("»»»»»ioManager load««««««");
var ioManager ={},
 events = require('events');
 //io = require('socket.io');

ioManager.init = function() {
    this.ioEvent = new events.EventEmitter();
};

ioManager.listen = function(io) {
    io.sockets.on('connection', function(socket){
        this.ioEvent.on('push', function(data){
            socket.emit('push', data);
            socket.emit('log', data);
        });
            socket.emit('log', 'ioManager start');
        socket.on('getUsersIssues', function(data){
            console.log("request getUsersIssues: ");
            console.log("data : ", data);
            socket.emit('push', data);
            this.ioEvent.emit('getUserIssues', 'rscrstcs');
            console.log("ioevent emit getUsersIssues: ");
        });
    });
};

module.exports = ioManager;
