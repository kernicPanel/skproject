var RealTeam = Ember.Application.create({
  socket: io.connect(window.location.hostname),
  issueSort: ['subject']
});
