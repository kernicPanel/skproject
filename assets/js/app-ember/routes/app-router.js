RealTeam.Router.map(function() {
  this.resource('teamMembers', function() {
    this.resource('teamMember', {path:':teamMember_id'}, function(){
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
    RealTeam.TeamMember.find();
  },
  init: function () {
    console.log('ApplicationRoute init');
  }
});

RealTeam.IndexRoute = Ember.Route.extend({
  redirect: function () {
    //this.transitionTo('teamMembers');
  },
  /*
   *setupController: function(controller, teamMembers) {
   *  controller.set('content', RealTeam.get('teamMembers'));
   *}
   */
  model: function() {
    return RealTeam.TeamMember.find();
  }
});

RealTeam.TeamMembersRoute = Ember.Route.extend({
  model: function() {
    return RealTeam.TeamMember.find();
  }
});

 //Auto generated
RealTeam.TeamMemberRoute = Ember.Route.extend({
  init: function () {
    console.log('TeamMemberRoute init');
  },
  model: function(params) {
    return RealTeam.TeamMember.find(params.teamMember_id);
  }
});

RealTeam.IssuesRoute = Ember.Route.extend({
  model: function() {
    return RealTeam.Issue.find();
  }
});
