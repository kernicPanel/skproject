//
//Users
//
app.Views.SkUserView = Backbone.View.extend({

    el: $('.nav-list'),

    initialize: function() {
        _.bindAll(this, 'render', 'addUser', 'appendUser'); // remember: every function that uses 'this' as the current object should be in here

        this.collection = new app.Collections.SkUserList();
        this.collection.bind('add', this.appendUser); // collection event binder

        this.render();
    },

    render: function() {
        return this;
    },
    addUser: function(skuser) {
        this.collection.add(skuser); // add skUser to collection; view is updated via event 'add'
    },
    appendUser: function(skuser){
        var html = ich.skuser({
            name: skuser.get('name'),
            current: skuser.get('current'),
            count: skuser.get('redmine').issues.length,
            issuesId: 'issues-' + skuser.get('id'),
            issuesIdTarget: '#issues-' + skuser.get('id')
        });
        var issues = skuser.get('redmine').issues;
        _.each(issues, function(issue){ 
            var issuesHtml = ich.userIssue({
                project: issue.project.name,
                subject: issue.subject,
                description: issue.description
            });
            $(html).find('.issues').append(issuesHtml);
        });

        $(html).attr('id', 'skuser-' + skuser.get('id'));
        //$(this.el).append(html);
        //$('.collapse').collapse('hide');
        $(this.el).append(html).collapse();
    /*
     *button.btn.btn-danger(data-toggle='collapse', data-target='{{issuesIdTarget}}')
     *      | {{name}} ({{count}})
     *ul.issues.collapse(id='{{issuesId}}')
     */
    }
});

//
//Issues
//
app.Views.IssueView = Backbone.View.extend({

    el: $('.content'),

    initialize: function() {
        _.bindAll(this, 'render', 'setUser', 'addIssue', 'appendIssue'); // remember: every function that uses 'this' as the current object should be in here

        this.collection = new app.Collections.IssueList();
        this.collection.bind('add', this.appendIssue); // collection event binder

        this.render();
    },

    render: function() {
        return this;
    },
    setUser: function(userId) {
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

app.Views.ProjectIssueView = app.Views.IssueView.extend({

    setProject: function(userId) {
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
app.Views.SkProjectView = Backbone.View.extend({

    el: $('.nav-list'),

    initialize: function() {
        _.bindAll(this, 'render', 'addProject', 'appendProject'); // remember: every function that uses 'this' as the current object should be in here

        this.collection = new app.Collections.SkProjectList();
        this.collection.bind('add', this.appendProject); // collection event binder

        this.render();
    },

    render: function() {
        return this;
    },
    addProject: function(skproject) {
        this.collection.add(skproject); // add skProject to collection; view is updated via event 'add'
    },
    appendProject: function(skproject){
        var html = ich.skproject({
            name: skproject.get('name'),
            count: skproject.get('issues').length,
            issuesId: 'issues-' + skproject.get('id'),
            issuesIdTarget: '#issues-' + skproject.get('id')
        });
        var issues = skproject.get('issues');
        _.each(issues, function(issue){ 
            var username = 'non assigné';
            if (issue.assigned_to) {
                username = issue.assigned_to.name;
            }
            var issuesHtml = ich.projectIssue({
                username: username,
                subject: issue.subject,
                description: issue.description
            });
            $(html).find('.issues').append(issuesHtml);
        });

        $(html).attr('id', 'skproject-' + skproject.get('id'));
        $(this.el).append(html).collapse();
    }
});

