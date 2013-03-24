RealTeam.User = DS.Model.extend({
  firstname: DS.attr('string'),
  lastname: DS.attr('string'),
  name: function() {
    return this.get('firstname') + ' ' + this.get('lastname');
  }.property('firstname', 'lastname'),
  issues: DS.hasMany('RealTeam.Issue'),
  current: DS.attr('string')
});

RealTeam.User.FIXTURES = [{
  id: 1,
  name: 'user 1',
  issue_ids: [1, 2, 5],
  current: 'none'
},{
  id: 2,
  name: 'user 2',
  issue_ids: [3, 4],
  current: 'nooone'
}];
