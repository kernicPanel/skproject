
// Requires Ember-Data

RealTeam.User = DS.Model.extend({
  name: DS.attr('string'),
  issuesCount: function () {
    return this.get('issues').loadingRecordsCount
  }.property('issues'),
  issues: DS.hasMany('RealTeam.Issue')
});

RealTeam.User.FIXTURES = [{
  id: 1,
  name: 'user 1',
  issues: [1, 2]
},{
  id: 2,
  name: 'user 2',
  issues: [3, 4]
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
}];
