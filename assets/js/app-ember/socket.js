RealTeam.socket.on('realTeam::connect', function (data){
  console.log('realTeam::connect');
  notyfy({text: 'Socket Connected', timeout:3000});
});

RealTeam.socket.on('redmine::currentIssueUpdated', function (issue){
  RealTeam.userController.updateCurrentIRCIssue(issue);
});

RealTeam.socket.on('issueStarted', function (issueStarted){
  console.log('issueStarted', issueStarted);
  RealTeam.userController.runTimer(issueStarted);
  if (RealTeam.currentuser.get('id') === issueStarted.userId) {
    var issue = RealTeam.Issue.find(issueStarted.issueId);
    RealTeam.currentuserController.updateCurrentIssue(issue);
    RealTeam.currentuser.set('currentIssue.currentTimer', - 60 * 60 * 1000);
    RealTeam.currentuserController.runTimer();
  }
});

RealTeam.socket.on('issuePaused', function (issue){
  console.log('issuePaused', issue);
  RealTeam.userController.updateCurrentIssue(issue);
  RealTeam.userController.pauseTimer(issue);
  if (RealTeam.currentuser.get('id') === issue.userId) {
    RealTeam.currentuserController.updateCurrentIssue(issue);
    if (issue.paused) {
      RealTeam.currentuserController.pauseTimer();
    }
    else {
      RealTeam.currentuserController.runTimer();
    }
  }
});

RealTeam.socket.on('issueStopped', function (userId){
  console.log('issueStopped', userId);
  RealTeam.userController.stopCurrentIssue(userId);
  RealTeam.userController.stopTimer(userId);
  if (RealTeam.currentuser.get('id') === userId) {
    RealTeam.currentuserController.stopTimer();
    RealTeam.currentuserController.updateCurrentIssue(null);
  }
});

RealTeam.socket.on('addTimeOk', function (data){
  console.log('addTimeOk', data);
  var text = 'Addtime OK<br>';
  text += data.time_entry.hours + ' hours added to ' + data.time_entry.issue.id;
  notyfy({text: text, timeout:5000});
});

RealTeam.socket.on('addTimeError', function (error, data){
  console.log('addTimeError', error, data);
  var text = 'Addtime ERROR !<br>';
  text += error + '<br> ';
  text += data.time_entry.hours + ' hours NOT added to ' + data.time_entry.issue_id + ' !!';
  notyfy({text: text, type: 'error', modal: true, layout: 'center'});
});

RealTeam.socket.on('updateIssue', function (issueId, detail){
  notyfy({text:'updating issue ' + issueId, layout: 'topRight', timeout:3000});
  console.log('issueId, detail', issueId, detail);

  console.log('RealTeam.Issue.isLoaded(issueId)', RealTeam.Issue.isLoaded(issueId));
  if (RealTeam.Issue.isLoaded(issueId)) {
    var issue = RealTeam.Issue.find(issueId);
    issue.reload();
    if (Ember.get(issue, 'isReloading')) {
      issue.on('didReload', function() {
        console.log("updateIssue Reloaded!");
        $("#select2Search").trigger('change');
      });
    }
    else {
      console.log("updateIssue Loaded!");
      $("#select2Search").trigger('change');
    }
  }
});

RealTeam.socket.on('removeUserIssue', function (data){
  console.log('removeUserIssue', data);
  if (RealTeam.User.isLoaded(data.userId)) {
    var updatedIssue = RealTeam.Issue.find(data.issueId);

    var removeUserIssue = function removeUserIssue(){
      user = RealTeam.User.find(data.userId);
      userIssues = user.get('issues');
      userIssues.removeObject(updatedIssue);
      user.set('issuesCount', user.get('issuesCount') - 1);
      $("#select2Search").trigger('change');
    };

    if (Ember.get(updatedIssue, 'isLoading') || Ember.get(updatedIssue, 'isReloading')) {
      updatedIssue.on('didLoad', function() {
        console.log("Loaded!");
        removeUserIssue();
      });
      updatedIssue.on('didReload', function() {
        console.log("Reloaded!");
        removeUserIssue();
      });
    }
    else {
      console.log("Already loaded!");
      removeUserIssue();
    }
  }
});

RealTeam.socket.on('addUserIssue', function (data){
  console.log('addUserIssue', data);
  if (RealTeam.User.isLoaded(data.userId)) {
    var updatedIssue = RealTeam.Issue.find(data.issueId);

    var addUserIssue = function addUserIssue(){
      user = RealTeam.User.find(data.userId);
      userIssues = user.get('issues');
      userIssues.pushObject(updatedIssue);
      user.set('issuesCount', user.get('issuesCount') + 1);
      $("#select2Search").trigger('change');
    };

    if (Ember.get(updatedIssue, 'isLoading') || Ember.get(updatedIssue, 'isReloading')) {
      updatedIssue.on('didLoad', function() {
        console.log("Loaded!");
        addUserIssue();
      });
      updatedIssue.on('didReload', function() {
        console.log("Reloaded!");
        addUserIssue();
      });
    }
    else {
      console.log("Already loaded!");
      addUserIssue();
    }
  }
});

RealTeam.socket.on('log', function(source, data){
  logData = data;
  console.group("source : ", source);
  console.log("data : ", data);
  console.groupEnd();
});
