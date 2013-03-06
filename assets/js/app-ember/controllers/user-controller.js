RealTeam.UserController = Ember.ObjectController.extend({
  sortProperties: ['id'],
  init: function(){
    console.log('init UserController');
  },
  updateCurrentIssue: function (issue) {
    console.log('user updateCurrentIssue', issue);
    var user = this.get('model');
    test = user;
    console.log('user', user);

//debugger;
    /*
     *tabItems.createRecord({
     *  food: food,
     *  cents: food.get('cents')
     *});
     */
  }
});
RealTeam.userController = RealTeam.UserController.create();

RealTeam.IssueController = Ember.ObjectController.extend({
  sortProperties: ['id'],
  init: function(){
    console.log('init UserController');
  },
  update: function (issue) {
    console.log('issue update', issue);
  }
});
RealTeam.issueController = RealTeam.IssueController.create();

