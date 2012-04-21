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
  init: function (personnages) {
    // Initialisation de la collection Personnages
    //this.collections.personnages = new this.Collections.personnages(personnages);
    // Initialisation du router, c'est lui qui va instancier notre vue
    //this.router = new app.Router();
    // On précise à Backbone JS de commencer à écouter les changement de l'url afin d’appeler notre routeur
    //Backbone.history.start();
    this.socket = socket = io.connect();

    this.views.skuserView = new this.Views.SkUserView();

    this.views.skprojectView = new this.Views.SkProjectView();

    //
    //Events
    //
    $('#sync').click(function() {
        socket.emit('redmine::sync', function (data) {
          console.log(data);
        });
    });

    $('#setusers').click(function() {
        socket.emit('setUsersIssues', function (data) {
          console.log(data);
        });
    });

    $('#getusers').click(function() {
        console.log("nrst: ");
        //skuserView.remove();
        socket.emit('getUsers', function (data) {
          console.log(data);
        });
    });

    $('#setprojects').click(function() {
        console.log("setprojects : ");
        socket.emit('setSkProjects', function (data) {
          console.log(data);
        });
    });

    $('#getprojects').click(function() {
        //skuserView.remove();
        socket.emit('getSkProjects', function (data) {
          console.log(data);
        });
    });


    socket.on('redmine::connect', function(data){
        console.log("redmine connect : ");
        socket.emit('getUsers', function (data) {
            console.log(data); // data will be 'woot'
        });

        socket.on('getUsers::response', function(data){
            console.log("getUsersIssues data : ", data);
            app.views.skuserView.addUsers(data);
        });

        socket.on('updateCurrentIssue::response', function(data){
            console.log("updateCurrentIssue data : ", data);
            app.views.skuserView.updateCurrentIssue(data.user, data.issue);
        });

        socket.on('getSkProjects::response', function(data){
            //console.log("data : ", data);
            app.views.skprojectView.addProjects(data);
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
