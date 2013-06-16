RealTeam.CurrentuserController = Ember.ObjectController.extend({
  //templateName: 'currentuser',
  init: function(){
    console.log('init CurrentuserController');
    console.log("this : ", this);
    console.log("this.content : ", this.content);
    console.log("this.model : ", this.model);
    console.log("RealTeam.currentuser : ", RealTeam.currentuser);
  },
  updateCurrentIssue: function (issue) {
    RealTeam.currentuser.set('currentIssue', issue);
  },
  runTimer: function(){
    RealTeam.currentuser.set('currentTimerId', setInterval(function(){
      var currentTimer = RealTeam.currentuser.get('currentIssue.currentTimer');
      RealTeam.currentuser.set('currentIssue.currentTimer', currentTimer + 1000);
    }, 1000));
  },
  pauseTimer: function(){
    clearInterval(RealTeam.currentuser.get('currentTimerId'));
  },
  stopTimer: function(){
    RealTeam.currentuser.set('currentIssue.currentTimer', - 60 * 60 * 1000);
    clearInterval(RealTeam.currentuser.get('currentTimerId'));
  },
  start: function(issue){
    //clearInterval(RealTeam.get('currentIntervalId'));
    //RealTeam.currentuser.set('currentIssue', issue);
    RealTeam.socket.emit('startIssue', issue.id, function (err, issue) {
      //console.log("startIssue : ", issue);
      //RealTeam.currentuserController.updateCurrentIssue(issue);
      ////RealTeam.currentuserController.stopTimer();
      //RealTeam.currentuser.set('currentIssue.currentTimer', - 60 * 60 * 1000);
      //RealTeam.currentuserController.runTimer();
    });
  },
  pause: function(){
    //clearInterval(RealTeam.get('currentIntervalId'));
    //RealTeam.currentuser.set('currentIssue', issue);
    console.log("pause currentuser : ");
    //RealTeam.currentuser.set('currentIssue', issue);
    RealTeam.socket.emit('pauseIssue', function (err, issue) {
      console.log("pauseIssue : ", issue);
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
      console.log("stopIssue : ", issue);
      RealTeam.currentuser.set('hasAddtime', true);
      issue.seconds = issue.pendingDuration / 1000;
      issue.minutes = Math.round(issue.seconds / 60);
      issue.hours = Math.floor(issue.minutes / 60);
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
      console.log(err, issue);
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

RealTeam.CurrentuserView = Ember.View.extend({
  //templateName: "currentuser",
  firstname: "cstcscstcs",
  fuck: function(){
    return "cstcscstcs";
  }
});
