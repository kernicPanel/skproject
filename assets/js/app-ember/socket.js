RealTeam.socket.on('realTeam::connect', function (data){
  console.log('realTeam::connect');
});

RealTeam.socket.on('irc::currentIssueUpdated', function (issue){
  //console.log('updateIssue', issue);
  //RealTeam.userController.find({login: issue.login});
  //RealTeam.issueController.find({login: issue.login});

  //RealTeam.userController.updateCurrentIssue(issue);
});

RealTeam.socket.on('updateIssue', function (data){
  console.log('updateIssue', data);
});
