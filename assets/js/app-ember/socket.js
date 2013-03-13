RealTeam.socket.on('realTeam::connect', function (data){
  console.log('realTeam::connect');
});

RealTeam.socket.on('redmine::currentIssueUpdated', function (issue){
  RealTeam.teamMemberController.updateCurrentIssue(issue);
});

RealTeam.socket.on('updateIssue', function (data){
  console.log('updateIssue', data);
});

RealTeam.socket.on('log', function(source, data){
  logData = data;
  console.group("source : ", source);
  console.log("data : ", data);
  console.groupEnd();
});
