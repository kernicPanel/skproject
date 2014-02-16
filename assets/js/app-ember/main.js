var RealTeam = Ember.Application.create({
  LOG_ACTIVE_GENERATION: true,
  LOG_VIEW_LOOKUPS: true,
  LOG_TRANSITIONS: true,
  socket: io.connect(window.location.hostname),
  issueSort: ['priority.id']
});
