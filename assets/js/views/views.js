//
//Users
//
app.Views.TeamMemberView = Backbone.View.extend({

    //el: $('.nav-list'),
    el: $('#content'),

    initialize: function() {
        _.bindAll(this, 'render', 'addUsers', 'addUser', 'appendUser'); // remember: every function that uses 'this' as the current object should be in here

        this.collection = new app.Collections.TeamMemberList();
        this.collection.bind('add', this.appendUser); // collection event binder

        this.render();
    },

    render: function() {
        return this;
    },
    events: {
        "click .showIssues": "showIssues",
        "click .showIssue": "showIssue",
        "click .showJournal": "showJournal"
    },
    addUsers: function(data) {
        console.log("data : ", data);
        var loopCount = data.length;
        for (var i = 0; i < loopCount; i++) {
            skuser = new app.Models.TeamMember();
            //skuserView.remove(skuser);
            skuser.set(data[i]);
            //skuser.set({id: data[i].login});
            this.addUser(skuser);
        }
        delete loopCount;
        $('.desc, .issues').hide().slideUp();

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
        //console.log("event : ", event);
        //console.log("this : ", this);
        test = event;
        var userId = $(event.target).data('user');
        var $issues = $('#issues-' + userId);
        var $user = $issues.parents('.user');
        //console.log("userId : ", userId);
        if (!$issues.data('loaded')) {
            var issues = app.collections.issueList.assignedTo(userId);
            test = issues;
            //console.log("issues : ", issues);
            issues.each(function(issue) {
                //console.log("issue : ", issue);
                var issuesHtml = ich.userIssue({
                    issueId: issue.get('id'),
                    issueDivId: 'issue-' + issue.get('id'),
                    project: issue.get('project').name,
                    priority: issue.get('priority').name,
                    subject: issue.get('subject'),
                    tracker: issue.get('tracker').name,
                    status: issue.get('status').name,
                    description: issue.get('description')
                });
                //console.log("issuesHtml : ", issuesHtml);
                $issues.append(issuesHtml);
            });
            $issues.data('loaded', true);
            $user.toggleClass('span4 span12');
            $('.issueContent').hide().slideUp();
            $issues.slideToggle('fast', function() {
                $('#content').isotope({}, function() {
                    //console.log("$issues : ", $issues);
                    $.scrollTo($issues.parents('.user').offset().top - 50, 400);
                });
            });
        }
        else {
            $user.toggleClass('span4 span12');
            $issues.slideToggle('fast', function() {
                $('#content').isotope({}, function() {
                    $.scrollTo($issues.parents('.user').offset().top - 50, 400);
                });
            });
        }
    },
    showIssue: function(event) {
        console.log("event.target : ", event.target);
        console.log("this : ", this);
        var issueId = $(event.target).parents('a').data('issue');
        var $issue = $('#issue-' + issueId);
        $issue.slideToggle('fast', function() {
            $('#content').isotope({}, function() {
                //$.scrollTo($issue.offset().top - 60, 400);
            });
        });
    },
    showJournal: function(event) {
        console.log("event.target : ", event.target);
        console.log("this : ", this);
        var issueId = $(event.target).data('issue');
        var $issue= $('#issue-' + issueId);
        $.scrollTo($issue.offset().top - 60, 400);
        var $issueJournal = $issue.find('.journal');
        console.log("$issueJournal : ", $issueJournal);

        if (!$issueJournal.data('loaded')) {
            socket.emit('redmine::getCompleteIssue', issueId, function (err, data) {
                //console.log("journals : ", data.issue.journals);
                var journals = data.issue.journals;
                var loopCount = journals.length;
                for (var i = 0; i < loopCount; i++) {
                    var journal = journals[i];
                    console.log("journal : ", journal);
                    var journalHtml = ich.journal({
                        name: journal.user.name,
                        created_on: journal.created_on,
                        notes: journal.notes
                    });
                    console.log("journalHtml : ", journalHtml);
                    $issueJournal.append(journalHtml);
                }
                delete loopCount;
                $issueJournal.data('loaded', true);
                $issueJournal.slideDown('fast', function() {
                    $('#content').isotope();
                });

            });
        }
        else {
            $issueJournal.slideToggle('fast', function() {
                $('#content').isotope({}, function() {
                    //$.scrollTo($issueJournal.parents('.user').offset().top - 50, 400);
                });
            });
        }
    },
    addUser: function(skuser) {
        this.collection.add(skuser); // add skUser to collection; view is updated via event 'add'
    },
    appendUser: function(skuser){
        //console.log("skuser : ", skuser);
        test = skuser;
        var currentIssue = skuser.get('current') || 'init';
        var issue = app.collections.issueList.get(skuser.get('issueId'));
        var priority = '';
        if (issue) {
            priority = issue.get('priority').name;
            //console.log("priority : ", priority);
            //currentIdClass = currentIdClass + ' badge';
        }
        console.groupCollapsed(skuser.get('name'), skuser);
            console.log("skuser.get('id') : ", skuser.get('id'));
            console.log("skuser.get('issueId') : ", skuser.get('issueId'));
            console.log("skuser.get('issueName') : ", skuser.get('issueName'));
            console.log("skuser.get('issueStatus') : ", skuser.get('issueStatus'));
            console.log("priority : ", priority);
            console.log("skuser.get('issueTime') : ", skuser.get('issueTime'));
        console.groupEnd();
        var html = ich.skuser({
            name: skuser.get('name'),
            id: skuser.get('id'),
            //current: currentIssue,
            currentId: skuser.get('issueId'),
            currentName: skuser.get('issueName'),
            currentStatus: skuser.get('issueStatus'),
            currentPriority: priority,
            currentTime: skuser.get('issueTime'),
            count: skuser.get('redmine').issues.length,
            issuesId: 'issues-' + skuser.get('id'),
            issuesIdTarget: '#issues-' + skuser.get('id')
        });

        $(html).attr('id', 'skuser-' + skuser.get('id'));
        $(this.el).append(html);
        $(this.el).on('shown hidden', function (e) {
            test = e;
            console.log("e.currentTarget: ", e.currentTarget);
              $('#content').isotope();
        });
    },
    updateCurrentIssue: function(data){
        var user = this.collection.where({login:data.login})[0];
        var issue = app.collections.issueList.get(data.issueId);
        //console.log("issue : ", issue);
        var priority = '';
        var currentIdClass = 'currentId';
        if (issue) {
            priority = issue.get('priority').name;
            //console.log("priority : ", priority);
            currentIdClass = currentIdClass + ' badge';
        }
        if (user) {
            //console.log("user update : ", user);
            user.set({
                currentId: data.issueId,
                currentName: data.issueName,
                currentStatus: data.issueStatus,
                currentPriority: priority,
                currentTime: data.issueTime
            });
            var id = user.get('id');
            var $userElem = $('#skuser-' + id);
            //$('#skuser-' + id).find('.current').html(issue);
            $userElem
                .find('.currentStatus').html(user.get('currentStatus')).end()
                .find('.currentPriority')
                    .attr('class', user.get('currentPriority') + ' currentPriority')
                    //.removeClass().addClass(user.get('currentPriority') + ' currentPriority')
                    .html(user.get('currentPriority')).end()
                .find('.currentId')
                    .attr('class', currentIdClass)
                    .html(user.get('currentId')).end()
                .find('.currentTime').html(user.get('currentTime')).end()
                .find('.currentName').html(user.get('currentName'));
            //console.log("$userElem : ", $userElem);
            $('#content').isotope();

        }
    },
    updateIssue: function(data) {
        console.log("updateIssue : ", data);
        var user = this.collection.where({id:data.assigned_to.id})[0];
        var issue = app.collections.issueList.get(data.id);
        //console.log("user : ", user);
        var assignedTo = data.assigned_to;
        if (issue && user) {
            //console.log("issue : ", issue);
            var wasAssignedTo = issue.get('assigned_to');
            console.log("wasAssignedTo : ", wasAssignedTo.id);
            console.log("assignedTo : ", assignedTo.id);
            app.collections.issueList.updateIssue(data);
            var id = user.get('id');
            var $userElem = $('#skuser-' + id);
            if (wasAssignedTo.id === assignedTo.id) {
                console.log("update issue view : ");
                var $issueElem = $('#issue-' + issue.get('id')).parents('.issue');
                //console.log("$issueElem : ", $issueElem);

                $issueElem
                    .find('.priority').html(issue.get('priority').name).end()
                    .find('.priority').html(issue.get('priority').name).end()
                    .find('.subject').html(issue.get('subject')).end()
                    .find('.tracker').html(issue.get('tracker').name).end()
                    .find('.status').html(issue.get('status').name).end()
                    .find('.desc').html(issue.get('description'));


            }
            else {
                console.log("delete and recreate : ");
                var $prevIssueElem = $('#issue-' + issue.get('id')).parents('.issue');
                console.log("$prevIssueElem : ", $prevIssueElem);
                $prevIssueElem.remove();

                var $issues = $('#issues-' + assignedTo.id);
                $issues.html('');
                app.collections.issueList.updateIssue(data);
                var issues = app.collections.issueList.assignedTo(assignedTo.id);
                issues.each(function(issue) {
                    var issuesHtml = ich.userIssue({
                        issueId: issue.get('id'),
                        issueDivId: 'issue-' + issue.get('id'),
                        project: issue.get('project').name,
                        priority: issue.get('priority').name,
                        subject: issue.get('subject'),
                        tracker: issue.get('tracker').name,
                        status: issue.get('status').name,
                        description: issue.get('description')
                    });
                    $issues.append(issuesHtml);
                });
                $issues.find('.issueContent').hide().slideUp();
                $('#content').isotope();
            }
        }
        else {
            console.log("delete issue : ");
            app.collections.issueList.updateIssue(data);
            var $prevIssueElem = $('#issue-' + issue.get('id')).parents('.issue');
            $prevIssueElem.remove();
            $('#content').isotope();
        }
    }
});

//
//Issues
//
app.Views.IssueView = Backbone.View.extend({

    el: $('.content'),

    initialize: function() {
        _.bindAll(this, 'render', 'setUser', 'addIssue', 'appendIssue', 'updateIssue'); // remember: every function that uses 'this' as the current object should be in here

        this.collection = new app.Collections.IssueList();
        this.collection.bind('add', this.appendIssue); // collection event binder
        this.collection.bind('change', this.updateIssue); // collection event binder

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
        console.log("issue.get('id') : ", issue.get('id'));
        var html = ich.userIssue({
            project: issue.get('project').name,
            subject: issue.get('subject'),
            description: issue.get('description')
        });
        $(html).attr('id', 'issue-' + issue.get('id'));
        $(this.el).append(html);
    },
    updateIssue: function(issue) {
        console.log("updateIssue : ", issue);
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
        $(this.el).append(html);
    }
});

