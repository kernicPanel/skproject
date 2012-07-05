
var app = {
  // Classes
  Collections: {},
  Models: {},
  Views: {},
  // Instances
  collections: {},
  views: {},
  //Events
  socket: {},
  init: function () {
    this.socket = socket = io.connect();

    socket.on('redmine::connect', function(data){
        console.log("redmine connect : ");

        socket.emit('redmineExtract', function(data) {
             console.log("data : ", data);
        });

        socket.on('log', function(data){
            console.log("data : ", data);
        });
    });
  }
};


$(function() {
    app.init();

});
