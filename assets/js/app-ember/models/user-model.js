
// Requires Ember-Data

RealTeam.User = DS.Model.extend({
  name: DS.attr('string'),
  /*
   *issuesCount: function () {
   *  return this.get('issues').length
   *}.property('issues'),
   */
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

RealTeam.Issue = DS.Model.extend({
  user: DS.belongsTo('RealTeam.User'),
  subject: DS.attr('string'),
  url: DS.attr('string')
});

RealTeam.Issue.FIXTURES = [{
  id: 1,
  subject: 'issue 1',
  url: 'nrsauti narsutin',
  user: 1
},{
  id: 2,
  subject: 'issue 2',
  url: 'rastmnsratmrstaust',
  user: 1
},{
  id: 3,
  subject: 'issue 3',
  url: 'rastmnsratmrstaust narsut anursit',
  user: 2
},{
  id: 4,
  subject: 'issue 4',
  url: 'mnrsaumauiauiu rastmnsratmrstaust',
  user: 2
},{
  id: 5,
  subject: 'issue 5',
  url: 'rastmnsratmrstaust',
  user: 1
}];
