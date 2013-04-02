Ember.Handlebars.registerBoundHelper('textile', function(input) {
  if (!!input) {
    return new Ember.Handlebars.SafeString(convert(input));
  }
  else {
    return '';
  }
});
