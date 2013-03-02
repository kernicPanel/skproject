// Requires Ember-Data
// App-Ember.Store = DS.Store.extend({
//   revision: 4,
//   adapter: DS.RESTAdapter.create()
// });
RealTeam.Store = DS.Store.extend({
  revision: 11,
  //adapter: 'DS.FixtureAdapter'
  //adapter: 'RealTeam.SocketAdapter'
  adapter: 'DS.RESTAdapter'
});
