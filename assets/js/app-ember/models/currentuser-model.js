/*
 *RealTeam.Currentuser = Ember.Object.extend();
 *RealTeam.Currentuser.reopenClass({
 *  login: 'initial login',
 *  hasAddtime: false,
 *  find: function(){
 *    console.log('Currentuser find start');
 *    $.getJSON('/currentuser', function(res) {
 *      console.log("res : ", res);
 *      if (res.currentuser.currentIssue) {
 *        console.log("res.currentuser.currentIssue.startedAt : ", res.currentuser.currentIssue.startedAt);
 *        //res.currentuser.currentIssue.startedAt = new Date(res.currentuser.currentIssue.startedAt);
 *        //console.log("res.currentuser.currentIssue.startedAt : ", res.currentuser.currentIssue.startedAt);
 *        res.currentuser.currentIssue.currentTimer = new Date().getTime() - res.currentuser.currentIssue.startedAt + res.currentuser.currentIssue.pendingDuration - 60 * 60 * 1000;
 *      }
 *      RealTeam.set('currentuser', RealTeam.Currentuser.create(res.currentuser));
 *      if (res.currentuser.currentIssue) {
 *        //RealTeam.currentuserController.runTimer();
 *      }
 *      return;
 *    });
 *  }
 *});
 */

RealTeam.Currentuser = DS.Model.extend({
  firstname: DS.attr('string'),
  lastname: DS.attr('string'),
  name: function() {
    return this.get('firstname') + ' ' + this.get('lastname');
  }.property('firstname', 'lastname'),
  issues: DS.hasMany('RealTeam.Issue'),
  current: DS.attr('string'),
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
}).reopenClass({
    find: function() {
        var currentuser = Ember.Object.create({
          isLoaded: false
        });

        $.getJSON('/currentuser/', function(currentuserData) {
          if (currentuserData.currentIssue) {
            currentuserData.currentIssue.currentTimer = new Date().getTime() - currentuserData.currentIssue.startedAt + currentuserData.currentIssue.pendingDuration - 60 * 60 * 1000;
          }
          currentuser.setProperties(currentuserData);
          currentuser.set('isLoaded', true);
          if (currentuserData.currentIssue) {
            RealTeam.currentuserController.runTimer();
          }
        });

        return currentuser;
    }
});

