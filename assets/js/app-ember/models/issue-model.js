RealTeam.Project = DS.Model.extend({
  description: DS.attr('string'),
  createdOn: DS.attr('string'),
  updatedOn: DS.attr('string'),
  identifier: DS.attr('string'),
  name: DS.attr('string'),
  parent: DS.belongsTo('RealTeam.Project'),
  children: DS.hasMany('RealTeam.Project'),
  issues: DS.hasMany('RealTeam.Issue'),
  issuesCount: function() {
    var issues = this.get('issues');
    return issues.toArray().length;
  }.property('issues'),

  isExpanded: false,
  expand: function() {
    this.set('isExpanded', true);
  },
  contract: function() {
    this.set('isExpanded', false);
  },
  hasChildren: function(){
    var children = this.get('children');
    return !!children.toArray().length;
  }.property('children'),
  hasParent: function(){
    return !!this.get('parent');
  }.property('parent')
});

RealTeam.Priority = DS.Model.extend({
  name: DS.attr('string'),
  issue: DS.belongsTo('RealTeam.Issue'),
  cssClass: function() {
    return 'priority' + this.get('id');
  }.property('id')
});

RealTeam.Status = DS.Model.extend({
  issue: DS.belongsTo('RealTeam.Issue'),
  name: DS.attr('string')
});
