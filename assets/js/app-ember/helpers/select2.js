Ember.Handlebars.registerBoundHelper('select2', function(date) {
  if (!!date) {
    return moment(date).fromNow();
  }
  else {
    return '';
  }
});
