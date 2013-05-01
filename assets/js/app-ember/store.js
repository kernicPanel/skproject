// Requires Ember-Data
//var adapter = DS.BasicAdapter.create();
RealTeam.Store = DS.Store.extend({
  revision: 12,
  //adapter: 'DS.FixtureAdapter'
  //adapter: 'RealTeam.SocketAdapter'
  adapter: 'DS.RESTAdapter'
  //adapter: adapter
});

DS.RESTAdapter.configure("plurals", {
    currentuser: "currentuser",
    priority: "priorities",
    status: "statuses",
    child: "children"
});
