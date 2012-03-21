/* Author: YOUR NAME HERE
*/

$(document).ready(function() {   

    var socket = io.connect();

    $('#sender').bind('click', function() {
        socket.emit('message', 'Message Sent on ' + new Date());     
    });

    socket.on('server_message', function(data){
        $('#reciever').append('<li>' + data + '</li>');  
    });

    socket.on('log', function(data){
        console.log("data : ", data);
    });

    socket.on('redmine::connect', function(data){
        //socket.emit("redmine::sync");
        /*
         *socket.emit('redmine::sync', 'sync', function (data) {
         *  console.log(data); // data will be 'woot'
         *});
         */
    });
    

    socket.on('redmine::response', function(data){
        console.log("data : ", data);
    });

    socket.on('mongo::connect', function(data){
        socket.emit("mongo::initObjects");
        /*
         *socket.emit('mongo::sync', 'sync', function (data) {
         *  console.log(data); // data will be 'woot'
         *});
         */
    });
    

    socket.on('mongo::response', function(data){
        console.log("data : ", data);
    });

});
