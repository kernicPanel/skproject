//
//Users
//
app.Views.SkUserView = Backbone.View.extend({

    //el: $('.nav-list'),
    el: $('#content'),

    initialize: function() {
        _.bindAll(this, 'render', 'addUsers', 'addUser', 'appendUser'); // remember: every function that uses 'this' as the current object should be in here

        this.collection = new app.Collections.SkUserList();
        this.collection.bind('add', this.appendUser); // collection event binder

        this.render();
    },

    render: function() {
        return this;
    },
    events: {
        "click .showIssues": "showIssues"
    },
    addUsers: function(data) {
        var loopCount = data.length;
        for (var i = 0; i < loopCount; i++) {
            skuser = new app.Models.SkUser();
            //skuserView.remove(skuser);
            skuser.set(data[i]);
            //skuser.set({id: data[i].login});
            this.addUser(skuser);
        }
        delete loopCount;
        $('.desc').hide().slideUp();
        $('.user .expand').on("click", function() {
            console.log("click : ", this);
            var $user = $(this).parents('.user');
            if ($user.hasClass('span4')) {
                $user.removeClass('span4').addClass('span12');
                $(this).find('i').removeClass('icon-resize-full').addClass('icon-resize-small');
            }
            else if ($user.hasClass('span12')) {
                $user.removeClass('span12').addClass('span4');
                $(this).find('i').removeClass('icon-resize-small').addClass('icon-resize-full');
            }
            $('#content').isotope();
        });
        $(".issue").find('a').on("click", function() {
            console.log("click : ", this);
            var $user = $(this).parents('.user');
            if ($user.hasClass('span4')) {
                $user.removeClass('span4').addClass('span12');
                $(this).find('i').removeClass('icon-resize-full').addClass('icon-resize-small');
            }
            else if ($user.hasClass('span12')) {
                $user.removeClass('span12').addClass('span4');
                $(this).find('i').removeClass('icon-resize-small').addClass('icon-resize-full');
            }
            $('#content').isotope();
            console.log("click : ", this);
            $(this)
            .find('i')
                .toggleClass('icon-chevron-down')
                .toggleClass('icon-chevron-up')
            .end()
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
    },
    showIssues: function(event) {
        console.log("event : ", event);
        console.log("this : ", this);
        test = event;
        $('#' + $(event.target).data('issues')).slideToggle();
        console.log("$(event.target) : ", $(event.target));
    },
    addUser: function(skuser) {
        this.collection.add(skuser); // add skUser to collection; view is updated via event 'add'
    },
    appendUser: function(skuser){
        //console.log("skuser : ", skuser);
        test = skuser;
        var currentIssue = skuser.get('current') || 'init';
        var html = ich.skuser({
            name: skuser.get('name'),
            current: currentIssue,
            count: skuser.get('redmine').issues.length,
            issuesId: 'issues-' + skuser.get('id'),
            issuesIdTarget: '#issues-' + skuser.get('id')
        });
        /*
         *var issues = skuser.get('redmine').issues;
         *_.each(issues, function(issue){ 
         *    var issuesHtml = ich.userIssue({
         *        project: issue.project.name,
         *        subject: issue.subject,
         *        description: issue.description
         *    });
         *    $(html).find('.issues').append(issuesHtml);
         *});
         */

        $(html).attr('id', 'skuser-' + skuser.get('id'));
        //$(this.el).append(html);
        //$('.collapse').collapse('hide');
        $(this.el).append(html).collapse();
        $(this.el).on('shown hidden', function (e) {
            test = e;
            console.log("e.currentTarget: ", e.currentTarget);
              $('#content').isotope();
        });
    /*
     *button.btn.btn-danger(data-toggle='collapse', data-target='{{issuesIdTarget}}')
     *      | {{name}} ({{count}})
     *ul.issues.collapse(id='{{issuesId}}')
     */
    },
    updateCurrentIssue: function(login, issue){
        var user = this.collection.where({login:login})[0];
        user.set({current: issue});
        var id = user.get('id');
        var userElem = $('#skuser-' + id);
        $('#skuser-' + id).find('.current').html(issue);
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
        _.bindAll(this, 'render', 'addProjects', 'addProject', 'appendProject'); // remember: every function that uses 'this' as the current object should be in here

        this.collection = new app.Collections.SkProjectList();
        this.collection.bind('add', this.appendProject); // collection event binder

        this.render();
    },

    render: function() {
        return this;
    },
    addProjects: function(data) {
        var loopCount = data.length;
        for (var i = 0; i < loopCount; i++) {
            skproject = new app.Models.SkProject();
            //skprojectView.remove(skproject);
            skproject.set(data[i]);
            this.addProject(skproject);
        }
        delete loopCount;
        $('.desc').hide().slideUp();
        $(".issue").find('a').on("click", function() {
            console.log("click : ");
            $(this).next('.desc').slideToggle();
        });
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

