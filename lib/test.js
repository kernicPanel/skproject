console.log("»»»»»test load««««««");
var test ={};
/* or
 * , var = require('toto');
 */

test.init = function() {
    io.sockets.on('connection', function(socket){
        test.start();
        socket.on('test::test', function(data){

        });
        socket.on('disconnect', function(data){
            test.stop();
        });
    });
};

test.start = function(callback) {
    callback = callback || function(){};
    callback();
};

test.stop = function(callback) {
    callback = callback || function(){};
    callback();
};

module.exports = test;
