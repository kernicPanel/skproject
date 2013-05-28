RealTeam.User = DS.Model.extend({
  firstname: DS.attr('string'),
  lastname: DS.attr('string'),
  name: function() {
    return this.get('firstname') + ' ' + this.get('lastname');
  }.property('firstname', 'lastname'),
  issues: DS.hasMany('RealTeam.Issue'),
  currentIssue: DS.belongsTo('RealTeam.Issue'),
  currentIssueTime: DS.attr('string'),
  currentIssueStatus: DS.attr('string'),
  currentIRCIssue: DS.belongsTo('RealTeam.Issue'),
  currentIRCIssueTime: DS.attr('string'),
  currentIRCIssueStatus: DS.attr('string'),
  issuesCount: function() {
    var issues = this.get('issues');
    return issues.toArray().length;
  }.property('issues')
  /*
   *issuesDisplayed: function() {
   *  //return this.get('issuesSorted');
   *  return this.get('issues');
   *}.property('issues')
   */
});

RealTeam.User.FIXTURES = [{
  id: 1,
  name: 'user 1',
  issue_ids: [1, 2, 5],
  current: 'none'
},{
  id: 2,
  name: 'user 2',
  issue_ids: [3, 4],
  current: 'nooone'
}];
