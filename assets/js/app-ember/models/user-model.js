
// Requires Ember-Data
// RealTeam.User = DS.Model.extend({});
RealTeam.User = DS.Model.extend({
  name: DS.attr('string'),
  //id: DS.attr('number'),
  //issues: DS.hasMany('RealTeam.Issues')
  //tab: DS.belongsTo('RealTeam.Tab')
});

RealTeam.User.FIXTURES = [];
