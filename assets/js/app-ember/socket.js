RealTeam.socket.on('realTeam::connect', function (data){
  console.log('realTeam::connect');
  notyfy({text: 'Socket Connected', timeout:3000});
});

RealTeam.socket.on('redmine::currentIssueUpdated', function (issue){
  RealTeam.userController.updateCurrentIRCIssue(issue);
});

RealTeam.socket.on('issueStarted', function (issue){
  console.log('issueStarted', issue);
  RealTeam.userController.runTimer(issue);
});

RealTeam.socket.on('issuePaused', function (issue){
  console.log('issuePaused', issue);
  //RealTeam.userController.updateCurrentIssue(issue);
  RealTeam.userController.pauseTimer(issue);
});

RealTeam.socket.on('issueStopped', function (userId){
  console.log('issueStopped', userId);
  //RealTeam.userController.updateCurrentIssue(issue);
  RealTeam.userController.stopTimer(userId);
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
