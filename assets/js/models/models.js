/*

Copyright (c) 2012 Nicolas Clerc <kernicpanel@nclerc.fr>

This file is part of redLive.

redLive is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

redLive is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with redLive.  If not, see <http://www.gnu.org/licenses/>.

*/

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



