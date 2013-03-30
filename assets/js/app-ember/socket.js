RealTeam.socket.on('realTeam::connect', function (data){
  console.log('realTeam::connect');
});

RealTeam.socket.on('redmine::currentIssueUpdated', function (issue){
  RealTeam.userController.updateCurrentIssue(issue);
});

RealTeam.socket.on('updateIssue', function (issue){
  console.log('updateIssue', issue);

  var updatedIssue = RealTeam.Issue.find(issue.id);
  console.log("updatedIssue : ", updatedIssue);

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

  var oldUser = RealTeam.User.find(data.userId);
  var oldUserIssues = oldUser.get('issues');
  oldUserIssues.removeObject(updatedIssue);
});

RealTeam.socket.on('addUserIssue', function (data){
  console.log('addUserIssue', data);

  var updatedIssue = RealTeam.Issue.find(data.issueId);

  var newUser = RealTeam.User.find(data.userId);
  var newUserIssues = newUser.get('issues');
  newUserIssues.addObject(updatedIssue);
});

RealTeam.socket.on('log', function(source, data){
  logData = data;
  console.group("source : ", source);
  console.log("data : ", data);
  console.groupEnd();
});
