RealTeam.CurrentuserController = Ember.ObjectController.extend({
  templateName: 'currentuser',
  init: function(){
    console.log('init CurrentuserController');
  },
  updateCurrentIssue: function (issue) {
    RealTeam.currentuser.set('currentIssue', issue);
  },
  runTimer: function(){
    RealTeam.currentuser.set('currentTimerId', setInterval(function(){
      var currentTimer = RealTeam.currentuser.get('currentTimer');
      console.log("pute : ", currentTimer);
      RealTeam.currentuser.set('currentTimer', currentTimer + 1);
    }, 1000));
  },
  pauseTimer: function(){
    clearInterval(RealTeam.currentuser.get('currentTimerId'));
  },
  stopTimer: function(){
    RealTeam.currentuser.set('currentTimer', 0);
    clearInterval(RealTeam.currentuser.get('currentTimerId'));
  },
  start: function(issue){
    //clearInterval(RealTeam.get('currentIntervalId'));
    //RealTeam.currentuser.set('currentIssue', issue);
    RealTeam.socket.emit('startIssue', issue.id, function (err, issue) {
      RealTeam.currentuserController.updateCurrentIssue(issue);
      //RealTeam.currentuserController.stopTimer();
      RealTeam.currentuser.set('currentTimer', 0);
      RealTeam.currentuserController.runTimer();
    });
  },
  pause: function(){
    //clearInterval(RealTeam.get('currentIntervalId'));
    //RealTeam.currentuser.set('currentIssue', issue);
    console.log("pause currentuser : ");
    //RealTeam.currentuser.set('currentIssue', issue);
    RealTeam.socket.emit('pauseIssue', function (err, issue) {
      console.log("pause : ", issue);
      RealTeam.currentuserController.updateCurrentIssue(issue);
      if (issue.paused) {
        RealTeam.currentuserController.pauseTimer();
      }
      else {
        RealTeam.currentuserController.runTimer();
      }
    });
  },
  stop: function(){
    //clearInterval(RealTeam.get('currentIntervalId'));
    RealTeam.socket.emit('stopIssue', function (err, issue) {
      RealTeam.currentuser.set('hasAddtime', true);
      issue.seconds = issue.pendingDuration / 1000;
      issue.minutes = Math.round(issue.seconds / 60);
      issue.hours = Math.round(issue.minutes / 60);
      issue.minutes = issue.minutes - issue.hours * 60;
      console.log("stop currentuser : ", issue);

      RealTeam.currentuserController.updateCurrentIssue(issue);
      RealTeam.currentuserController.stopTimer();
    });
  },
  addTime: function(){
    console.log("RealTeam.currentuser.get('currentIssue') : ", RealTeam.currentuser.get('currentIssue'));
    var currentIssue = RealTeam.currentuser.get('currentIssue');
    console.log("addTime currentuser : ", currentIssue);
    RealTeam.socket.emit('addTime', currentIssue, function (err, issue) {
      RealTeam.currentuser.set('hasAddtime', false);
      RealTeam.currentuserController.updateCurrentIssue(null);
    });
  },
  cancelTime: function(){
    //console.log("RealTeam.currentuser.get('currentIssue') : ", RealTeam.currentuser.get('currentIssue'));
    console.log("cancelTime currentuser : ");
    RealTeam.currentuser.set('hasAddtime', false);
    RealTeam.currentuserController.updateCurrentIssue(null);
  }
});

RealTeam.currentuserController = RealTeam.CurrentuserController.create();
