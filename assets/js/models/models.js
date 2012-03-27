//
//Users
//
app.SkUser = Backbone.Model.extend({
    initialize: function() {
    }
});

//app.skuser = new SkUser('my name');
app.SkUserList = Backbone.Collection.extend({
    model: SkUser
});


//
//Issues
//
app.Issue = Backbone.Model.extend({
    initialize: function() {
    }
});

var IssueList = Backbone.Collection.extend({
    model: Issue
});



//
//Projects
//
app.SkProject = Backbone.Model.extend({
    initialize: function() {
    }
});

//app.skproject = new SkProject('my name');
app.SkProjectList = Backbone.Collection.extend({
    model: SkProject
});



