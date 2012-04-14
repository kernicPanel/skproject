
this.socket = socket = io.connect();

var App = Ember.Application.create({
    ready: function(){
       console.log('you did it!');
    }
});

App.users = Ember.Object.extend();

App.Team = Ember.View.create({
    templateName: "team",
    test: function(event){
        console.log("test3 this : ", this);
        console.log("test3 event : ", event);
        v2_this = this;
        v2_event = event;
    },
    didInsertElement: function(){
        console.log("motherfucKER this.$() : ", this.$());
    }
}).appendTo('#content');

App.userController = Ember.ArrayController.create({
    content: [],
    loadUser: function(data){
        App.userController.pushObject(data);
    },
    test: function(data){
        console.log("test this : ", this);
        console.log("test data : ", data);
        c_this = this;
        c_data = data;
        console.log("data.get('_parentView').get('content').get('redmine').issues : ", data.get('_parentView').get('content').get('redmine').issues);
    }
});

App.User = Em.View.extend({
    templateName: "user",
    test: function(event){
        console.log("test3 this : ", this);
        console.log("test3 event : ", event);
        v2_this = this;
        v2_event = event;
    },
    showIssues: function(event){
        //console.log("event.view.$() : ", event.view.$());
        event.view.$()
            .find('.user').toggleClass('span4 span12')
            .find('.issues').slideToggle('fast', function() {
                App.$content.isotope({}, function() {
                    $.scrollTo(event.view.$().find('.user').position().top + 50, 400);
                });
            });
    },
    didInsertElement: function(){
        console.log("this : ", this);
        console.log("this.$() : ", this.$());
        this.$().find('.issues').slideUp();
        test = this.$().find('.user');
        App.$content.isotope( 'appended', this.$().find('.user') );
        App.$content.isotope({ sortBy : 'name' });
    }
});

App.Issue = Em.View.extend({
    templateName: "issue",
    showIssueDesc: function(event){
        //console.log("event : ", event);
        //console.log("event.view.$() : ", event.view.$());
        event.view.$().find('.desc').slideToggle('fast', function() {
            App.$content.isotope();
        });
    },
    didInsertElement: function(){
        //console.log("this.$() : ", this.$());
        this.$().find('.desc').slideUp('fast', function() {
            App.$content.isotope();
        });
    }
});


socket.on('redmine::connect', function(data){
    console.log("redmine connect : ");
    /*
     *socket.emit('getUsersIssues', function (data) {
     *    console.log(data); // data will be 'woot'
     *});
     */

    socket.on('getUsersIssues::response', function(data){
        console.log("getUsersIssues data : ", data);
        //App.userController.loadUsers(data);
        var loopCount = data.length;
        for (var i = 0; i < loopCount; i++) {
            console.log("getUsersIssues data : ", data[i].redmine);
            var user = App.users.create(data[i]);
            user.set('userId', 'user-' + user.get('id'));
            user.set('issuesId', 'issues-' + user.get('id'));
            App.userController.loadUser(user);

        }
        delete loopCount;
        console.log("done : ");
        App.$content = $('#content');
        App.$content.isotope({
            // options
            itemSelector : '.user',
            //layoutMode : 'fitRows',
            animationOptions: {
                duration: 400,
                queue: false
            },
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
        App.$isotope = App.$content.data('isotope');
        $('#sort-by a').click(function(){
            // get href attribute, minus the '#'
            var sortName = $(this).attr('href').slice(1);
            if (App.$isotope.options.sortBy === sortName) {
                App.$content.isotope({ sortAscending : !App.$isotope.options.sortAscending });
            }
            else {
                App.$content.isotope({ sortBy : sortName });
            }
            return false;
        });
    });

    socket.on('updateCurrentIssue::response', function(data){
        console.log("updateCurrentIssue data : ", data);
        var user = App.userController.findProperty('login', data.user);
        if (!!user) {
            user.set('current', data.issue);
        }
    });

    socket.on('log', function(data){
        console.log("data : ", data);
    });
});

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
