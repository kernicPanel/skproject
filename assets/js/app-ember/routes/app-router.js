// RealTeam.Router = Ember.Router.extend({
//   root: Ember.Route.extend({
//     index: Ember.Route.extend({
//       route: '/'

//       // You'll likely want to connect a view here.
//       // connectOutlets: function(router) {
//       //   router.get('applicationController').connectOutlet(RealTeam.MainView);
//       // }

//       // Layout your routes here...
//     })
//   })
// });

RealTeam.Router.map(function() {
  this.resource('users', function() {
    this.resource('user', {path:':user_id'});
  });
});

/*
 *RealTeam.Router.map(function() {
 *  this.resource('users', function() {
 *    //this.resource('user', {path:':user_id'});
 *    this.resource('user', {path:':user_id'}, function(){
 *      this.resource('issues', function(){
 *        console.log('nrstnrst');
 *      });
 *    });
 *  });
 *});
 */

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
    console.log('UserRoute model', params);
    //return RealTeam.Issue.find(params.user_id);
  }
});
