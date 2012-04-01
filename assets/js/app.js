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
        //skuserView.remove();
        socket.emit('getUsersIssues', function (data) {
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


    //socket.on('redmine::connect', function(data){
        console.log("redmine connect : ");
        /*
         *socket.emit('getUsersIssues', function (data) {
         *    console.log(data); // data will be 'woot'
         *});
         */

        socket.on('getUsersIssues::response', function(data){
            console.log("getUsersIssues data : ", data);
            var loopCount = data.length;
            for (var i = 0; i < loopCount; i++) {
                skuser = new app.Models.SkUser();
                //skuserView.remove(skuser);
                skuser.set(data[i]);
                //skuser.set({id: data[i].login});
                app.views.skuserView.addUser(skuser);
            }
            delete loopCount;
            $('.desc').hide().slideUp();
            $(".issue").find('a').on("click", function() {
                console.log("click : ");
                $(this).next('.desc').slideToggle();
            });
        });

        socket.on('updateCurrentIssue::response', function(data){
            console.log("updateCurrentIssue data : ", data);
            app.views.skuserView.updateCurrentIssue(data.user, data.issue);
        });

        socket.on('getSkProjects::response', function(data){
            //console.log("data : ", data);
            var loopCount = data.length;
            for (var i = 0; i < loopCount; i++) {
                skproject = new app.Models.SkProject();
                //skprojectView.remove(skproject);
                skproject.set(data[i]);
                app.views.skprojectView.addProject(skproject);
            }
            delete loopCount;
            $('.desc').hide().slideUp();
            $(".issue").find('a').on("click", function() {
                console.log("click : ");
                $(this).next('.desc').slideToggle();
            });
        });

        socket.on('push', function(data){
            console.log("push : ");
            console.log("data : ", data);
        });
        socket.on('log', function(data){
            console.log("data : ", data);
        });
    //});
  }
};


$(function() {
    app.init();

});
