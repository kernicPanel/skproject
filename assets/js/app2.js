
this.socket = socket = io.connect();

var App = Ember.Application.create({
    ready: function(){
       console.log('you did it!');
    }
});

App.users = Ember.Object.extend();

App.Team = Ember.View.extend({
    test: function(event){
        console.log("test3 this : ", this);
        console.log("test3 event : ", event);
        v2_this = this;
        v2_event = event;
    },
    didInsertElement: function(){
        console.log("motherfucKER this.$() : ", this.$());
        //this.$().find('.issues').slideUp();
    }
});

App.userController = Ember.ArrayController.create({
    content: [],
    loadUser: function(data){
        App.userController.pushObject(data);
        console.log("user : ", data.toString());
        $('.issues').slideUp();
    },
    test: function(data){
        console.log("test this : ", this);
        console.log("test data : ", data);
        c_this = this;
        c_data = data;
        console.log("data.get('_parentView').get('content').get('redmine').issues : ", data.get('_parentView').get('content').get('redmine').issues);
        App.Team.test();
    }
});

App.User = Em.View.extend({
    //tagName: "li",
    templateName: "user",
    test: function(event){
        console.log("test3 this : ", this);
        console.log("test3 event : ", event);
        v2_this = this;
        v2_event = event;
    },
    showIssues: function(event){
        //console.log("event.view.$() : ", event.view.$());
        event.view.$().find('.issues').slideToggle();
    },
    showIssueDesc: function(event){
        console.log("event : ", event);
        //console.log("event.view.$() : ", event.view.$());
        //event.view.$().find('.issues').slideToggle();
    },
    didInsertElement: function(){
        //console.log("this.$() : ", this.$());
        this.$().find('.issues').slideUp();
    }
});

App.Issue = Em.View.extend({
    //tagName: "li",
    templateName: "issue",
    showIssueDesc: function(event){
        console.log("event : ", event);
        //console.log("event.view.$() : ", event.view.$());
        event.view.$().find('.desc').slideToggle();
    },
    didInsertElement: function(){
        //console.log("this.$() : ", this.$());
        this.$().find('.desc').slideUp();
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
