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
    console.log('sortProperties', sortProperties);
    var sortAsc;
    if (sort === sortProperties[0]) {
      sortAsc = issuesSorted.get('sortAscending');
      issuesSorted.set('sortAscending', !sortAsc);
    }
    else {
      issuesSorted.set('sortProperties', [sort]);
      issuesSorted.set('sortAscending', asc);
    }
    sortAsc = issuesSorted.get('sortAscending');
    this.set('issuesDisplayed', this.get('issuesSorted'));
  },
  issuesSorted: function() {
    issues =  Ember.ArrayProxy.createWithMixins(Ember.SortableMixin, {
      sortProperties: RealTeam.issueSort,
      sortAscending: false,
      //filterProperty: {doneRatio: 0},
      content: this.get('model.issues')
    });

    //return issues.filterProperty('priority.name', 'Immédiat');

    return issues;
  }.property('model.issues.@each.id'),
  issuesDisplayed: function() {
    return this.get('issuesSorted');
  }.property('model.issues.@each.id'),
  filter: function(filter){
    console.log('filter', filter);
    this.set('filtered', !this.get('filtered'));
    console.log('this.filtered', this.get('filtered'));
    var issuesSorted = this.get('issuesSorted');
    if (this.get('filtered')) {
      this.set('issuesDisplayed', issuesSorted.filterProperty('priority.name', filter));
    }
    else {
      this.set('issuesDisplayed', this.get('model.issues'));
    }
  },
  filtered: false,
  scope: function(arg){
    console.log('issue scope', arg);
    test = arg;
  }
});

RealTeam.UsersController = Ember.ArrayController.extend({
  sortProperties: ['name'],
  sortAscending: true
});

RealTeam.userController = RealTeam.UserController.create();
