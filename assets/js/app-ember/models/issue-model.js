RealTeam.Project = DS.Model.extend({
  description: DS.attr('string'),
  createdOn: DS.attr('string'),
  updatedOn: DS.attr('string'),
  identifier: DS.attr('string'),
  name: DS.attr('string')
});

RealTeam.Priority = DS.Model.extend({
  name: DS.attr('string'),
  cssClass: function() {
    return 'priority' + this.get('id');
  }.property('id'),
});

RealTeam.Status = DS.Model.extend({
  name: DS.attr('string')
});
