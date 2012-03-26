$(function() {
    window.socket = io.connect();

    //
    //Users
    //
    window.SkUser = Backbone.Model.extend({
        initialize: function() {
        }
    });

    //window.skuser = new SkUser('my name');
    window.SkUserList = Backbone.Collection.extend({
        model: SkUser
    });


    window.SkUserView = Backbone.View.extend({

        el: $('.content'),

        // The TodoView listens for changes to its model, re-rendering.
        initialize: function() {
            _.bindAll(this, 'render', 'addUser', 'appendUser'); // remember: every function that uses 'this' as the current object should be in here

            this.collection = new SkUserList();
            this.collection.bind('add', this.appendUser); // collection event binder

            this.render();
        },

        // Re-render the contents of the todo item.
        render: function() {
            //console.log("render : ");
            //console.log("this.el : ", this.el);
            return this;
        },
        addUser: function(skuser) {
            this.collection.add(skuser); // add skUser to collection; view is updated via event 'add'
        },
        appendUser: function(skuser){
            var html = ich.skuser({
                name: skuser.get('name')
            });
            $(html).attr('id', 'skuser-' + skuser.get('id'));
            $(this.el).append(html);
        }
    });

    window.skuserView = new SkUserView();

    //
    //Issues
    //
    window.Issue = Backbone.Model.extend({
        initialize: function() {
        }
    });

    var IssueList = Backbone.Collection.extend({
        model: Issue
    });


    window.IssueView = Backbone.View.extend({

        el: $('.content'),

        // The TodoView listens for changes to its model, re-rendering.
        initialize: function() {
            _.bindAll(this, 'render', 'setUser', 'addIssue', 'appendIssue'); // remember: every function that uses 'this' as the current object should be in here

            this.collection = new IssueList();
            this.collection.bind('add', this.appendIssue); // collection event binder

            this.render();
        },

        // Re-render the contents of the todo item.
        render: function() {
            //console.log("render : ");
            //console.log("this.el : ", this.el);
            return this;
        },
        setUser: function(userId) {
            //this.collection.add(issue); // add issue to collection; view is updated via event 'add'
            this.el = $('#skuser-' + userId + ' ul.issues');
        },
        addIssue: function(issue) {
            this.collection.add(issue); // add issue to collection; view is updated via event 'add'
        },
        appendIssue: function(issue){
            var html = ich.userIssue({
                project: issue.get('project').name,
                subject: issue.get('subject'),
                description: issue.get('description')
            });
            $(html).attr('id', 'issue-' + issue.get('id'));
            $(this.el).append(html);
        }
    });

    window.ProjectIssueView = IssueView.extend({

        setProject: function(userId) {
            //this.collection.add(issue); // add issue to collection; view is updated via event 'add'
            this.el = $('#skproject-' + userId + ' ul.issues');
        },
        appendIssue: function(issue){
            var username = 'non assigné';
            if (issue.has('assigned_to')) {
                username = issue.get('assigned_to').name;
            }
            var html = ich.projectIssue({
                subject: issue.get('subject'),
                description: issue.get('description'),
                username: username
            });
            $(html).attr('id', 'issue-' + issue.get('id'));
            $(this.el).append(html);
        }
    });

    //
    //Projects
    //
    window.SkProject = Backbone.Model.extend({
        initialize: function() {
        }
    });

    //window.skproject = new SkProject('my name');
    window.SkProjectList = Backbone.Collection.extend({
        model: SkProject
    });


    window.SkProjectView = Backbone.View.extend({

        el: $('.content'),

        // The TodoView listens for changes to its model, re-rendering.
        initialize: function() {
            _.bindAll(this, 'render', 'addProject', 'appendProject'); // remember: every function that uses 'this' as the current object should be in here

            this.collection = new SkProjectList();
            this.collection.bind('add', this.appendProject); // collection event binder

            this.render();
        },

        // Re-render the contents of the todo item.
        render: function() {
            //console.log("render : ");
            //console.log("this.el : ", this.el);
            return this;
        },
        addProject: function(skproject) {
            this.collection.add(skproject); // add skProject to collection; view is updated via event 'add'
        },
        appendProject: function(skproject){
            var html = ich.skproject({
                name: skproject.get('name')
            });
            $(html).attr('id', 'skproject-' + skproject.get('id'));
            $(this.el).append(html);
        }
    });

    window.skprojectView = new SkProjectView();

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


    socket.on('redmine::connect', function(data){
        console.log("redmine connect : ");
        /*
         *socket.emit('getUsersIssues', function (data) {
         *    console.log(data); // data will be 'woot'
         *});
         */

        socket.on('getUsersIssues::response', function(data){
            console.log("data : ", data);
            var loopCount = data.length;
            for (var i = 0; i < loopCount; i++) {
                skuser = new SkUser();
                //skuserView.remove(skuser);
                skuser.set(data[i]);
                skuserView.addUser(skuser);

                var loopCount2 = data[i].redmine.issues.length;
                for (var j = 0; j < loopCount2; j++) {
                    var curIssue = data[i].redmine.issues[j];
                    //console.log("curIssue : ", curIssue);
                    var issueView = new IssueView();
                    issueView.setUser(skuser.get('id'));
                    var issue = new Issue();
                    issue.set(curIssue);
                    issueView.addIssue(issue);
                }
                delete loopCount2;
            }
            delete loopCount;
            $('.desc').hide().slideUp();
            $(".issue").find('a').on("click", function() {
                console.log("click : ");
                $(this).next('.desc').slideToggle();
            });
        });

        socket.on('getSkProjects::response', function(data){
            //console.log("data : ", data);
            var loopCount = data.length;
            for (var i = 0; i < loopCount; i++) {
                skproject = new SkProject();
                //skprojectView.remove(skproject);
                skproject.set(data[i]);
                skprojectView.addProject(skproject);

                var loopCount2 = data[i].issues.length;
                for (var j = 0; j < loopCount2; j++) {
                    var curIssue = data[i].issues[j];
                    //console.log("curIssue : ", curIssue);
                    var issueView = new ProjectIssueView();
                    issueView.setProject(skproject.get('id'));
                    var issue = new Issue();
                    issue.set(curIssue);
                    issueView.addIssue(issue);
                }
                delete loopCount2;
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
});
