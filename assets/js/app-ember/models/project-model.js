RealTeam.Issue = DS.Model.extend({
  user: DS.belongsTo('RealTeam.User'),
  project: DS.belongsTo('RealTeam.Project'),
  subject: DS.attr('string'),
  url: DS.attr('string'),
  description: DS.attr('string'),
  createdOn: DS.attr('string'),
  updatedOn: DS.attr('string'),
  spentHours: DS.attr('number'),
  estimatedHours: DS.attr('number'),
  status: DS.belongsTo('RealTeam.Status'),
  priority: DS.belongsTo('RealTeam.Priority')
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
