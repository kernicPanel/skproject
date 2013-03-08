RealTeam.TeamMemberController = Ember.ObjectController.extend({
  init: function(){
    console.log('init TeamMemberController');
  },
  updateCurrentIssue: function (issue) {
    var teamMember = RealTeam.TeamMember.find(issue.teamMemberId);
    teamMember.set('current', issue.issueId);

//debugger;
  },
  start: function(issue){
    console.log('teamMember start', issue.get('id'));
  }
});

RealTeam.TeamMembersController = Ember.ArrayController.extend({
  sortProperties: ['name'],
  sortAscending: true,
});

RealTeam.teamMemberController = RealTeam.TeamMemberController.create();

RealTeam.IssueController = Ember.ObjectController.extend({
  init: function(){
    console.log('init TeamMemberController');
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

