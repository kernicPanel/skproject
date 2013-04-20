RealTeam.socket.on('realTeam::connect', function (data){
  console.log('realTeam::connect');
  notyfy({text: 'Socket Connected', timeout:3000});
});

RealTeam.socket.on('redmine::currentIssueUpdated', function (issue){
  RealTeam.userController.updateCurrentIssue(issue);
});

RealTeam.socket.on('updateIssue', function (issueID, detail){
  notyfy({text:'updating issue ' + issueID, layout: 'topRight', timeout:3000});
  //notyfy({text:'from ' + issue.assigned_to.name, layout: 'topRight', timeout:3000});
  //notyfy({text:'to ' + issue.assigned_to.name, layout: 'topRight', timeout:3000});
  console.log('issueID, detail', issueID, detail);

  var updatedIssue = RealTeam.Issue.find(issueID);
  console.log("updatedIssue : ", updatedIssue);
  test = detail;
  if (detail.name ==='status_id') {
    updatedIssue.set('status', RealTeam.Status.find( detail.new_value ));
  }

  if (detail.name ==='priority_id') {
    updatedIssue.set('priority', RealTeam.Priority.find( detail.new_value ));
  }

  if (detail.name ==='done_ratio') {
    updatedIssue.set('doneRatio', detail.new_value );
  }

/*
 *  var oldUser = RealTeam.User.find(data.oldUserId);
 *  var oldUserIssues = oldUser.get('issues');
 *  oldUserIssues.removeObject(updatedIssue);
 *
 *  var newUser = RealTeam.User.find(data.newUserId);
 *  var newUserIssues = newUser.get('issues');
 *  newUserIssues.addObject(updatedIssue);
 */

  //issues.removeObject(RealTeam.Issue.find(8770))
  //issues.addObject
});

RealTeam.socket.on('removeUserIssue', function (data){
  console.log('removeUserIssue', data);

  var updatedIssue = RealTeam.Issue.find(data.issueId);

  var user = RealTeam.User.find(data.userId);
  var userIssues = user.get('issues');
  userIssues.removeObject(updatedIssue);
  user.set('issuesCount', user.get('issuesCount') - 1);
});

RealTeam.socket.on('addUserIssue', function (data){
  console.log('addUserIssue', data);

  var updatedIssue = RealTeam.Issue.find(data.issueId);

  var user = RealTeam.User.find(data.userId);
  var userIssues = user.get('issues');
  userIssues.addObject(updatedIssue);
  user.set('issuesCount', user.get('issuesCount') + 1);
});

RealTeam.socket.on('log', function(source, data){
  logData = data;
  console.group("source : ", source);
  console.log("data : ", data);
  console.groupEnd();
});
