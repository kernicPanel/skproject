
this.socket = socket = io.connect();

var App = Ember.Application.create({
    ready: function(){
       console.log('you did it!');
    }
});

App.users = Ember.Object.extend();
App.issue = Ember.Object.extend();

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
    loadIssues: function(userId, data){
        console.log("userController loadIssues userId : ", userId);
        console.log("userController loadIssues data : ", data);
        var loopCount = data.length;
        for (var i = 0; i < loopCount; i++) {
            //console.log("getUsers data : ", data[i]);
            //console.log("getUsers redmine : ", data[i].redmine);
            var issue = App.issue.create(data[i]);
            App.issueController.loadIssue(issue);
            var user = App.userController.findProperty('id', userId);
            if (!!user) {
                //user.set('currentId', data.issueId);
                //user.set('currentName', data.issueName);
                //user.set('currentStatus', data.issueStatus);
                //user.set('currentTime', data.issueTime);
                ////user.set('currentUrl', data.issueUrl);
                //App.$content.isotope();
            }

        }
        delete loopCount;
    },
    showIssuesCtrl: function(data){
        console.log("test this : ", this);
        console.log("test data : ", data);
        c_this = this;
        c_data = data;
        console.log("data.get('_parentView').get('content').get('redmine').issues : ", data.get('_parentView').get('content').get('redmine').issues);
    },
    test: function(data){
        console.log("test this : ", this);
        console.log("test data : ", data);
        c_this = this;
        c_data = data;
        console.log("data.get('_parentView').get('content').get('redmine').issues : ", data.get('_parentView').get('content').get('redmine').issues);
    }
});


App.issueController = Ember.ArrayController.create({
    content: [],
    showIssue: function(event) {
        console.log("event : ", event);
        test = event;

    },
    loadIssue: function(issue){
        console.log("this : ", this);
        console.log("loadIssue : ", issue);
        issue.assignedToId = issue.assigned_to.id;
        App.issueController.pushObject(issue);
    },
    loadIssues: function(data){
        //console.log("this : ", this);
        console.log("loadIssues data : ", data);

        var loopCount = data.length;
        for (var i = 0; i < loopCount; i++) {
            //console.log("getUsers data : ", data[i]);
            //console.log("getUsers redmine : ", data[i].redmine);
            var issue = App.issue.create(data[i]);
            App.issueController.loadIssue(issue);

        }
        delete loopCount;
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
        console.log("showIssues : ");
        console.log("this : ", this);
        //console.log("event.view.$() : ", event.view.$());
        var view = event.view;
        test = event;
        console.log("event.view.$() : ", event.view.$());
        if (!view.$().find('.issues').hasClass('loaded')) {
            var userId = view.$().find('.user').get(0).id;
            // console.log("view.$().find('.user').get(0).id : ", view.$().find('.user').get(0).id);
            //socket.emit('redmine::getUserIssues', view.$().find('.user').get(0).id, function (data) {
            console.log('userId', userId);
            socket.emit('getUserIssues', userId, function (err, issues) {
                console.log('issues', issues);
                //console.log(issues[0].description);
                //test = issues;
                //var issue = App.issue.create(issues);
                App.userController.loadIssues(userId, issues);
                view.$().find('.issues').addClass('loaded');

                console.log("userId : ", userId);
                userId = userId.split('_')[1];
                console.log("userId : ", userId);
                E_issues = App.issueController.filterProperty('assignedToId', userId);
                console.log("E_issues : ", E_issues);
                //this.set('issues', issues)

                view.set('issues', issues);
                //view.set('description', issue.description);
                //view.set('tracker', issue.tracker);
                //view.set('status', issue.status);
                //view.set('id', issue.id);
                view.$()
                    .find('.user').toggleClass('span4 span12')
                    .find('.issues').slideToggle('fast', function() {
                        App.$content.isotope({}, function() {
                            $.scrollTo(event.view.$().find('.user').offset().top - 50, 400);
                        });
                    });
            });
        }
        else {
            view.$()
                .find('.user').toggleClass('span4 span12')
                .find('.issues').slideToggle('fast', function() {
                    App.$content.isotope({}, function() {
                        $.scrollTo(view.$().find('.user').position().top + 50, 400);
                    });
                });
        }

        /*
         *event.view.$()
         *    .find('.user').toggleClass('span4 span12')
         *    .find('.issues').slideToggle('fast', function() {
         *        App.$content.isotope({}, function() {
         *            $.scrollTo(event.view.$().find('.user').position().top + 50, 400);
         *        });
         *    });
         */
    },
    didInsertElement: function(){
        //console.log("didInsertElement : ");
        //console.log("this : ", this);
        //console.log("this.$() : ", this.$());
        this.$().find('.issues, .info').slideUp();
        //test = this.$().find('.user');
        testInsert = this;
        App.$content.isotope( 'appended', this.$().find('.user') );
        App.$content.isotope({ sortBy : 'name' });
    }
});

App.Issue = Em.View.extend({
    templateName: "issue",
    showIssue: function(event){
        console.log("showIssue : ");
        //console.log("event : ", event);
        var view = event.view;
        test = event;
        //console.log("event.view.$() : ", event.view.$());
        if (!view.$().find('.issueContent').hasClass('loaded')) {
            socket.emit('redmine::getIssue', event.view.$().find('.issue').get(0).id, function (data) {
                console.log(data);
                //console.log(data[0].description);
                //test = data;
                //var issue = App.issue.create(data);
                //App.issueController.loadIssue(issue);
                var issue = data[0];
                view.$().find('.issueContent').addClass('loaded');
                view.set('description', issue.description);
                view.set('tracker', issue.tracker);
                view.set('status', issue.status);
                view.set('id', issue.id);
                $(event.target).next('.issueContent').slideToggle('fast', function() {
                    App.$content.isotope({}, function() {
                        $.scrollTo(event.view.$().find('.issue').offset().top - 50, 400);
                    });
                });
            });
        }
        else {
            $(event.target).next('.issueContent').slideToggle('fast', function() {
                App.$content.isotope({}, function() {
                    $.scrollTo(event.view.$().parents('.user').position().top + 50, 400);
                });
            });
        }
    },
    didInsertElement: function(){
        //console.log("didInsertElement : ");
        //console.log("this.$() : ", this.$());
        this.$().find('.issueContent, .journal').slideUp('fast', function() {
            App.$content.isotope();
        });
    }
});

App.IssueContent = Em.View.extend({
    templateName: "issueContent",
    showIssue: function(event){
        console.log("showIssue : ");
        //console.log("event : ", event);
        var view = event.view;
        test = event;
        //console.log("event.view.$() : ", event.view.$());
        if (!view.$().find('.issueContent').hasClass('loaded')) {
            socket.emit('redmine::getIssue', event.view.$().parents('.issue').get(0).id, function (data) {
                console.log(data);
                //console.log(data[0].description);
                //test = data;
                //var issue = App.issue.create(data);
                //App.issueController.loadIssue(issue);
                //var issue = data[0];
                var issue = data;
                view.$().find('.issueContent').addClass('loaded');
                view.set('description', issue.description);
                view.set('tracker', issue.tracker);
                view.set('status', issue.status);
                view.set('id', issue.id);
                $(event.target).next('.issueContent').slideToggle('fast', function() {
                    App.$content.isotope({}, function() {
                        $.scrollTo(event.view.$().parents('.issue').offset().top - 50, 400);
                    });
                });
            });
        }
        else {
            $(event.target).next('.issueContent').slideToggle('fast', function() {
                App.$content.isotope({}, function() {
                    $.scrollTo(event.view.$().parents('.user').position().top + 50, 400);
                });
            });
        }
    },
    loadMore: function(event) {
        console.log("loadMore : ");
        //console.log("this : ", this);
        //console.log("event : ", event);
        var view = event.view;

        test = event;
        console.log("view : ", view);
        if (!view.$().find('.journal').hasClass('loaded')) {
            socket.emit('redmine::getCompleteIssue', view.$().parents('.issue').get(0).id, function (data) {
                console.log("journals : ", data.issue.journals);
                //var issue = data[0];
                view.$().find('.journal').addClass('loaded');
                //view.set('description', issue.description);
                //view.set('tracker', issue.tracker);
                view.set('journal', data.issue.journals);
                view.$().find('.journal').slideToggle('fast', function() {
                    App.$content.isotope();
                });

            });
        }
        else {
            view.$().find('.journal').slideToggle('fast', function() {
                App.$content.isotope();
            });
        }
    },
    didInsertElement: function(){
        //console.log("didInsertElement : ");
        testInsert = this;
        //console.log("this.$() : ", this.$());
        this.$().find('.issueContent, .journal').slideUp('fast', function() {
            App.$content.isotope();
        });
    }
});

App.IssueJournal = Em.View.extend({
    templateName: "issueJournal",
    didInsertElement: function(){
        //console.log("this.$() : ", this.$());
    }
});

socket.on('realTeam::connect', function(data){
    console.log('realTeam::connect');
    noty({text: 'Socket Connected', timeout:3000});

    socket.emit('getUsers', {}, function (err, users) {
        console.log(users); // users will be 'woot'
    // });

    // socket.on('getUsers::response', function(users){
        //console.log("getUsers users : ", users);
        //App.userController.loadUsers(users);
        var loopCount = users.length;
        for (var i = 0; i < loopCount; i++) {
            //console.log("getUsers users : ", users[i]);
            //console.log("getUsers redmine : ", users[i].redmine);
            var user = App.users.create(users[i]);
            user.set('userId', 'user-' + user.get('id'));
            user.set('issuesId', 'issues-' + user.get('id'));
            App.userController.loadUser(user);

        }
        delete loopCount;
        //console.log("done : ");
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
        //console.log("updateCurrentIssue data : ", data);
        var user = App.userController.findProperty('login', data.login);
        if (!!user) {
            user.set('currentId', data.issueId);
            user.set('currentName', data.issueName);
            user.set('currentStatus', data.issueStatus);
            user.set('currentTime', data.issueTime);
            //user.set('currentUrl', data.issueUrl);
            App.$content.isotope();
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
