RealTeam.UserController = Ember.ObjectController.extend({
  init: function(){
    console.log('init UserController');
  },
  updateCurrentIssue: function (issue) {
    var user = RealTeam.User.find(issue.userId);
    user.set('current', issue.issueId);

//debugger;
  }
});

RealTeam.UsersController = Ember.ArrayController.extend({
  sortProperties: ['name'],
  sortAscending: true,
});

RealTeam.userController = RealTeam.UserController.create();

RealTeam.IssueController = Ember.ObjectController.extend({
  init: function(){
    console.log('init UserController');
  },
  update: function (issue) {
    console.log('issue update', issue);
  }
});

RealTeam.IssuesController = Ember.ArrayController.extend({
  sortProperties: ['id'],
  sortAscending: false,
});

RealTeam.issueController = RealTeam.IssueController.create();

