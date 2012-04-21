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
            /*
             *var loopCount = data.length;
             *for (var i = 0; i < loopCount; i++) {
             *    skuser = new app.Models.SkUser();
             *    //skuserView.remove(skuser);
             *    skuser.set(data[i]);
             *    //skuser.set({id: data[i].login});
             *    app.views.skuserView.addUser(skuser);
             *}
             *delete loopCount;
             */
            $('.desc').hide().slideUp();
            $('.user .expand').on("click", function() {
                console.log("click : ", this);
                var $user = $(this).parents('.user');
                if ($user.hasClass('span4')) {
                    $user.removeClass('span4').addClass('span8');
                    $(this).find('i').removeClass('icon-resize-full').addClass('icon-resize-small');
                }
                else if ($user.hasClass('span8')) {
                    $user.removeClass('span8').addClass('span4');
                    $(this).find('i').removeClass('icon-resize-small').addClass('icon-resize-full');
                }
                $('#content').isotope();
            });
            $(".issue").find('a').on("click", function() {
                console.log("click : ", this);
                $(this)
                //.find('i')
                    //.toggleClass('icon-chevron-down')
                    //.toggleClass('icon-chevron-up')
                //.end()
                .next('.desc').slideToggle('fast', function() {
                    $('#content').isotope();
                });
            });

            var $content = $('#content');
            $content.isotope({
                // options
                itemSelector : '.user',
                //layoutMode : 'fitRows',
                getSortData : {
                    name : function ( $elem ) {
                        return $elem.find('.name').text();
                    },
                    count : function ( $elem ) {
                        return parseInt($elem.find('.count').text(), 10);
                    }
                },
                sortBy : 'name'
            });
            $isotope = $content.data('isotope');
            $('#sort-by a').click(function(){
                // get href attribute, minus the '#'
                var sortName = $(this).attr('href').slice(1);
                if ($isotope.options.sortBy === sortName) {
                    $content.isotope({ sortAscending : !$isotope.options.sortAscending });
                }
                else {
                    $content.isotope({ sortBy : sortName });
                }
                return false;
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

        socket.on('log', function(data){
            console.log("data : ", data);
        });
    });
  }
};


$(function() {
    app.init();

});
