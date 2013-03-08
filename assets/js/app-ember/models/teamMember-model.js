
// Requires Ember-Data

RealTeam.TeamMember = DS.Model.extend({
  name: DS.attr('string'),
  /*
   *issuesCount: function () {
   *  return this.get('issues').length
   *}.property('issues'),
   */
  issues: DS.hasMany('RealTeam.Issue'),
  current: DS.attr('string')
});

RealTeam.TeamMember.FIXTURES = [{
  id: 1,
  name: 'teamMember 1',
  issue_ids: [1, 2, 5],
  current: 'none'
},{
  id: 2,
  name: 'teamMember 2',
  issue_ids: [3, 4],
  current: 'nooone'
}];

RealTeam.Issue = DS.Model.extend({
  teamMember: DS.belongsTo('RealTeam.TeamMember'),
  subject: DS.attr('string'),
  url: DS.attr('string')
});

RealTeam.Issue.FIXTURES = [{
  id: 1,
  subject: 'issue 1',
  url: 'nrsauti narsutin',
  teamMember: 1
},{
  id: 2,
  subject: 'issue 2',
  url: 'rastmnsratmrstaust',
  teamMember: 1
},{
  id: 3,
  subject: 'issue 3',
  url: 'rastmnsratmrstaust narsut anursit',
  teamMember: 2
},{
  id: 4,
  subject: 'issue 4',
  url: 'mnrsaumauiauiu rastmnsratmrstaust',
  teamMember: 2
},{
  id: 5,
  subject: 'issue 5',
  url: 'rastmnsratmrstaust',
  teamMember: 1
}];
