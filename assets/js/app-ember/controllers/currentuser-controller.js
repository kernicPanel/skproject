RealTeam.CurrentuserController = Ember.ObjectController.extend({
  templateName: 'currentuser',
  init: function(){
    console.log('init CurrentuserController');
  },
  updateCurrentIssue: function (issue) {
    RealTeam.currentuser.set('currentTask', issue);
  },
  start: function(issue){
    //RealTeam.currentuser.set('currentTask', issue);
    RealTeam.socket.emit('startIssue', issue.id, function (err, issue) {
      RealTeam.currentuserController.updateCurrentIssue(issue);
    });
  },
  pause: function(){
    //RealTeam.currentuser.set('currentTask', issue);
    console.log("pause currentuser : ");
    //RealTeam.currentuser.set('currentTask', issue);
    RealTeam.socket.emit('pauseIssue', function (err, issue) {
      console.log("pause : ", issue);
      RealTeam.currentuserController.updateCurrentIssue(issue);
    });
  },
  stop: function(){
    RealTeam.socket.emit('stopIssue', function (err, issue) {
      RealTeam.currentuser.set('hasAddtime', true);
      issue.seconds = issue.pendingDuration / 1000;
      issue.minutes = Math.round(issue.seconds / 60);
      issue.hours = Math.round(issue.minutes / 60);
      issue.minutes = issue.minutes - issue.hours * 60;
      console.log("stop currentuser : ", issue);

      RealTeam.currentuserController.updateCurrentIssue(issue);
    });
  },
  addTime: function(){
    console.log("RealTeam.currentuser.get('currentTask') : ", RealTeam.currentuser.get('currentTask'));
    var currentIssue = RealTeam.currentuser.get('currentTask');
    console.log("addTime currentuser : ", currentIssue);
    RealTeam.socket.emit('addTime', currentIssue, function (err, issue) {
      RealTeam.currentuser.set('hasAddtime', false);
      RealTeam.currentuserController.updateCurrentIssue(null);
    });
  },
  cancelTime: function(){
    //console.log("RealTeam.currentuser.get('currentTask') : ", RealTeam.currentuser.get('currentTask'));
    console.log("cancelTime currentuser : ");
    RealTeam.currentuser.set('hasAddtime', false);
    RealTeam.currentuserController.updateCurrentIssue(null);
  }
});

RealTeam.currentuserController = RealTeam.CurrentuserController.create();
