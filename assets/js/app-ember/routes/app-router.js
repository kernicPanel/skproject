// RealTeam.Router = Ember.Router.extend({
//   root: Ember.Route.extend({
//     index: Ember.Route.extend({
//       route: '/'

//       // You'll likely want to connect a view here.
//       // connectOutlets: function(router) {
//       //   router.get('applicationController').connectOutlet(App.MainView);
//       // }

//       // Layout your routes here...
//     })
//   })
// });

RealTeam.Router.map(function() {
  this.route("user", { path: "/user" });
  // this.route("favorites", { path: "/favs" });
});