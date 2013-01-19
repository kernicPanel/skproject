App = Em.Application.create({
  ready: function() {
    var socket = App.socket = io.connect();

    socket.on('realTeam::connect', function(data){
      console.log('realTeam::connect');
      noty({text: 'Socket Connected', timeout:3000});

      socket.emit('getUsers', {}, function (err, users) {
          console.log(users); // users will be 'woot'
      });
    });
  }
});