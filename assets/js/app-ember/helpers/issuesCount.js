Ember.Handlebars.registerBoundHelper('issuesCount', function(user) {
  return user.get('issues').get('content').length;
});
