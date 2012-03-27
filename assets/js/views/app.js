//
//Users
//
app.SkUserView = Backbone.View.extend({

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

app.skuserView = new SkUserView();

//
//Issues
//
app.IssueView = Backbone.View.extend({

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

app.ProjectIssueView = IssueView.extend({

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
app.SkProjectView = Backbone.View.extend({

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

