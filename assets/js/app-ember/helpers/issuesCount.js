Ember.Handlebars.registerBoundHelper('issuesCount', function(teamMember) {
  return teamMember.get('issues').get('content').length;
});
