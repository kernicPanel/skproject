RealTeam.Router.map(function() {
  this.resource('users', function() {
    this.resource('user', {path:':user_id'}, function(){
      this.route("issues");
      this.route("issue", { path: "/issues/:issue_id" });
    });
  });
  this.resource('issues', function() {
    this.route("issues");
  });
});

RealTeam.ApplicationRoute = Ember.Route.extend({
  setupController: function () {
    //this.controllerFor('food').set('model', RealTeam.Food.find());
  },
  init: function () {
    console.log('ApplicationRoute init');
  }
});

RealTeam.IndexRoute = Ember.Route.extend({
  redirect: function () {
    //this.transitionTo('users');
  },
  /*
   *setupController: function(controller, users) {
   *  controller.set('content', RealTeam.get('users'));
   *}
   */
  model: function() {
    return RealTeam.User.find();
  }
});

RealTeam.UsersRoute = Ember.Route.extend({
  model: function() {
    return RealTeam.User.find();
  }
});

 //Auto generated
RealTeam.UserRoute = Ember.Route.extend({
  init: function () {
    console.log('UserRoute init');
  },
  model: function(params) {
    return RealTeam.User.find(params.user_id);
  }
});

RealTeam.IssuesRoute = Ember.Route.extend({
  model: function() {
    return RealTeam.Issue.find();
  }
});
