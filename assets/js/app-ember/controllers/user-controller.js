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
    //return this.get('issuesSorted');
    return this.get('model.issues');
  }.property('model.issues.@each.id'),
  filterString: '',
  filter: function(filter){
    filter = new RegExp(this.get('filterString'), 'i');
    var issuesSorted = this.get('model.issues');
    if (filter.toString() !== '/(?:)/i') {
      //var issuesDisplayed = issuesSorted.filterProperty('priority.name', filter);
      var issuesDisplayed = issuesSorted.filter(function(item, index, self) {
        var isDisplayed = false;
        item.eachRelationship(function(attr, val){
          var attributeName = item.get(attr).get('name');
          if (!!attributeName && !!attributeName.toString().match(filter)) {
            isDisplayed = true;
            return true;
          }
        });
        item.eachAttribute(function(attr, val){
          var attributeName = item.get(attr);
          if (!!attributeName && !!attributeName.toString().match(filter)) {
            isDisplayed = true;
            return true;
          }
        });
        return isDisplayed;
      });
      this.set('issuesDisplayed', issuesDisplayed);
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

RealTeam.userController = RealTeam.UserController.create();

RealTeam.IssueFilter = Ember.TextField.extend({
  filterStringBinding: 'RealTeam.userController.filterString',
  change: function(evt) {
    this.get('controller').filter();
  }
});

RealTeam.UsersController = Ember.ArrayController.extend({
  sortProperties: ['name'],
  sortAscending: true
});

