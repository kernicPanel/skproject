RealTeam.Router.map(function() {
  this.resource('users', function() {
    this.resource('user', {path:':user_id'}, function(){
      this.route("issues");
      this.route("issue", { path: "/issues/:issue_id" });
    });
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
    this.transitionTo('users');
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
