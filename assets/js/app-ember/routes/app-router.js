RealTeam.Router.map(function() {
  this.resource('users', function() {
    this.resource('user', {path:':user_id'}, function(){
      this.route("issues");
      this.route("issue", { path: "/issues/:issue_id" });
    });
  });
  this.resource('projects', function() {
    this.route("projects");
    this.resource('project', {path:':project_id'}, function(){
      this.route("project", { path: "/projects/:project_id" });
    });
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
    pause: function() {
      // do your business.
      //console.log("pause ApplicationRoute : ");
      RealTeam.currentuserController.pause();
    },
    stop: function() {
      // do your business.
      //console.log("stop ApplicationRoute : ");
      RealTeam.currentuserController.stop();
    },
    addTime: function() {
      // do your business.
      //console.log("addTime ApplicationRoute : ");
      RealTeam.currentuserController.addTime();
    },
    cancelTime: function() {
      // do your business.
      //console.log("cancelTime ApplicationRoute : ");
      RealTeam.currentuserController.cancelTime();
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

RealTeam.ProjectsRoute = Ember.Route.extend({
  model: function() {
    return RealTeam.Project.find();
  }
});

RealTeam.ProjectRoute = Ember.Route.extend({
  init: function () {
    console.log('ProjectRoute init');
  },
  model: function(params) {
    var currentProject = RealTeam.Project.find(params.project_id);
    currentProject.on('didLoad', function(){
      if (currentProject.get('hasParent')) {
        currentProject.get('parent').set('isExpanded', true);
      }
    });
    return currentProject;
  }
});
