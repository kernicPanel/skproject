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
    RealTeam.currentuserController.start(issue);
  },
  sort: function(sort, asc){
    if (typeof asc === 'undefined') {
      asc = true;
    }
    var issuesSorted = this.get('issuesSorted');
    var sortProperties = issuesSorted.get('sortProperties');
    if (sort === sortProperties[0]) {
      var sortAsc = issuesSorted.get('sortAscending');
      issuesSorted.set('sortAscending', !sortAsc);
    }
    else {
      issuesSorted.set('sortProperties', [sort]);
      issuesSorted.set('sortAscending', asc);
    }
    var sortAsc = issuesSorted.get('sortAscending');
  },
  issuesSorted: function() {
    return Ember.ArrayProxy.createWithMixins(Ember.SortableMixin, {
      sortProperties: RealTeam.issueSort,
      sortAscending: false,
      content: this.get('model.issues')
    });
  }.property('model.issues.@each.id'),
  scope: function(arg){
    console.log('issue scope', arg);
    test = arg;
  }
});

RealTeam.UsersController = Ember.ArrayController.extend({
  sortProperties: ['name'],
  sortAscending: true,
});

RealTeam.userController = RealTeam.UserController.create();
