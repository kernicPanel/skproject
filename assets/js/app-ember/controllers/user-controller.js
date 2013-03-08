RealTeam.UserController = Ember.ObjectController.extend({
  init: function(){
    console.log('init UserController');
  },
  updateCurrentIssue: function (issue) {
    var user = RealTeam.User.find(issue.userId);
    user.set('current', issue.issueId);

//debugger;
  },
  start: function(issue){
    console.log('user start', issue.get('id'));
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
  },
  start: function(arg){
    console.log('issue start', arg);
  }
});

RealTeam.IssuesController = Ember.ArrayController.extend({
  sortProperties: ['id'],
  sortAscending: false,
  start: function(issue){
    console.log('issue start', issue.get('id'));
  }
});

RealTeam.issueController = RealTeam.IssueController.create();

