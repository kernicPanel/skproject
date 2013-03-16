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
    RealTeam.User.find();

    //this.controllerFor('currentuser').set('model', RealTeam.Currentuser.find());
    RealTeam.Currentuser.find();
    //RealTeam.currentuser = RealTeam.Currentuser.find();
    //RealTeam.set('currentUser', RealTeam.Currentuser.find());
  },
  init: function () {
    console.log('ApplicationRoute init');
  },
  events: {
    stop: function() {
      // do your business.
      console.log("stop ApplicationRoute : ");
      RealTeam.currentuserController.stop();
    }
  }

});

RealTeam.IndexRoute = Ember.Route.extend({
  model: function() {
    return RealTeam.User.find();
  }
});

RealTeam.UsersRoute = Ember.Route.extend({
  model: function() {
    return RealTeam.User.find();
  }
});

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
