Ember.Handlebars.registerBoundHelper('date', function(date) {
  if (!!date) {
    return moment(date).fromNow();
  }
  else {
    return '';
  }
});
