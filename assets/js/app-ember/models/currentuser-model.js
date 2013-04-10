RealTeam.Currentuser = Ember.Object.extend();
RealTeam.Currentuser.reopenClass({
  login: 'initial login',
  hasAddtime: false,
  find: function(){
    console.log('Currentuser find start');
    $.getJSON('/currentuser', function(res) {
      console.log("res : ", res);
      if (res.currentuser.currentIssue) {
        console.log("res.currentuser.currentIssue.startedAt : ", res.currentuser.currentIssue.startedAt);
        //res.currentuser.currentIssue.startedAt = new Date(res.currentuser.currentIssue.startedAt);
        //console.log("res.currentuser.currentIssue.startedAt : ", res.currentuser.currentIssue.startedAt);
        res.currentuser.currentIssue.currentTimer = new Date().getTime() - res.currentuser.currentIssue.startedAt + res.currentuser.currentIssue.pendingDuration - 60 * 60 * 1000;
      }
      RealTeam.set('currentuser', RealTeam.Currentuser.create(res.currentuser));
      if (res.currentuser.currentIssue) {
        RealTeam.currentuserController.runTimer();
      }
      return;
    });
  }
});

