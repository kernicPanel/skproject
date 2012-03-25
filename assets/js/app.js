$(function() {
    window.socket = io.connect();

    window.SkUser = Backbone.Model.extend({
        initialize: function() {
        }
    });

    //window.skuser = new SkUser('my name');
    var SkUserList = Backbone.Collection.extend({
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
            $(html).attr('id', 'skuser-' + skuser.get('_id'));
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
            var html = ich.issue({
                subject: issue.get('subject')
            });
            $(html).attr('id', 'issue-' + issue.get('_id'));
            $(this.el).append(html);
        }
    });

    $('#sync').click(function() {
        socket.emit('redmine::sync', function (data) {
          console.log(data);
        });
    });

    /*
     *$('#getusers').click(function() {
     *    socket.emit('getUsersIssues', function (data) {
     *      console.log(data);
     *    });
     *});
     */

    socket.on('redmine::connect', function(data){
        console.log("redmine connect : ");
        socket.emit('getUsersIssues', function (data) {
            console.log(data); // data will be 'woot'
        });

        socket.on('redmine::response', function(data){
            console.log("data : ", data);
            var loopCount = data.length;
            for (var i = 0; i < loopCount; i++) {
                skuser = new SkUser();
                skuser.set(data[i]);
                skuserView.addUser(skuser);

                var loopCount2 = data[i].redmine.issues.length;
                for (var j = 0; j < loopCount2; j++) {
                    var curIssue = data[i].redmine.issues[j];
                    console.log("curIssue : ", curIssue);
                    var issueView = new IssueView();
                    issueView.setUser(skuser.get('_id'));
                    var issue = new Issue();
                    issue.set(curIssue);
                    issueView.addIssue(issue);
                }
                delete loopCount2;
            }
            delete loopCount;
        });

    });
});
