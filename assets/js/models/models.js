//
//Users
//
app.Models.TeamMember = Backbone.Model.extend({
    initialize: function() {
    }
});

app.Collections.TeamMemberList = Backbone.Collection.extend({
    model: app.Models.TeamMember
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
    updateIssue: function(data) {
        var issue = this.get(data.id);
        //console.log("issue.get('assigned_to').name : ", issue.get('assigned_to').name);
        issue.clear();
        issue.set(data);
        //console.log("issue.get('assigned_to').name : ", issue.get('assigned_to').name);
        //this.trigger('change', this.get(data.id));
    },
    assignedTo : function(id){
        if(id === "") {
            return this;
        }

        return _(this.filter(function(data) {
            return data.get('assigned_to').id === id;
        }));
    },
    comparator : function(issue) {
          return - issue.get('priority').id;
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



