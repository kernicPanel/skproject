//
//Users
//
app.Models.SkUser = Backbone.Model.extend({
    initialize: function() {
    }
});

app.Collections.SkUserList = Backbone.Collection.extend({
    model: app.Models.SkUser
});


//
//Issues
//
app.Models.Issue = Backbone.Model.extend({
    initialize: function() {
    }
});

app.Collections.IssueList = Backbone.Collection.extend({
    model: app.Models.Issue,
    addIssues: function(data) {
        this.add(data);
    },
    assignedTo : function(id){
        if(id === "") {
            return this;
        }

        return _(this.filter(function(data) {
            return data.get('assigned_to').id === id;
        }));
    }
});



//
//Projects
//
app.Models.SkProject = Backbone.Model.extend({
    initialize: function() {
    }
});

app.Collections.SkProjectList = Backbone.Collection.extend({
    model: app.Models.SkProject
});



