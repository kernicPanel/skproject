RealTeam.UserController = Ember.ObjectController.extend({
  sortProperties: ['name'],
  sortAscending: false,
  init: function(){
    console.log('init UserController');
  },
  updateCurrentIssue: function (issue) {
    var user = RealTeam.User.find(issue.userId);
    user.set('current', issue.issueId);

//debugger;
  }
});
RealTeam.userController = RealTeam.UserController.create();

RealTeam.IssueController = Ember.ObjectController.extend({
  sortProperties: ['id'],
  sortAscending: false,
  init: function(){
    console.log('init UserController');
  },
  update: function (issue) {
    console.log('issue update', issue);
  }
});
RealTeam.issueController = RealTeam.IssueController.create();

