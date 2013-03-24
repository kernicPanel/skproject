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
  stop: function(){
    //RealTeam.currentuser.set('currentTask', issue);
    console.log("stop currentuser : ");
    //RealTeam.currentuser.set('currentTask', issue);
    RealTeam.socket.emit('stopIssue', function (err, issue) {
      RealTeam.currentuserController.updateCurrentIssue(issue);
    });
  }
});

RealTeam.currentuserController = RealTeam.CurrentuserController.create();
