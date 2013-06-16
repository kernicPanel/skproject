RealTeam.IssueController = Ember.ObjectController.extend({
  init: function(){
    console.log('init UserController');
  },
  update: function (issue) {
    console.log('issue update', issue);
  },
  start: function(issue){
    console.log('issue start', issue.get('id'));
    RealTeam.currentuserController.start(issue);
  },
  scope: function(arg){
    console.log('issue scope', arg);
  }
});

RealTeam.IssuesController = Ember.ArrayController.extend({
  //sortProperties: ['id'],
  //sortAscending: false,
  start: function(issue){
    console.log('issue start', issue.get('id'));
    RealTeam.currentuserController.start(issue);
  },
  scope: function(arg){
    console.log('issue scope', arg);
  }
});

RealTeam.issueController = RealTeam.IssueController.create();

