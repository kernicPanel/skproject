// 'use strict';

/* Controllers */

      console.log(jQuery('#content'));
function AppCtrl($scope, socket, search) {
  socket.on('send:name', function (data) {
    $scope.name = data.name;
  });

  var usersLoaded = false;

  socket.on('redlive::connect', function (data){
    console.log('redlive::connect');
    noty({text: 'Socket Connected', timeout:3000});
    // noty({text: 'noty - a jquery notification library!', layout: 'topRight'});
    // noty({text: 'noty - a jquery notification library!', layout: 'top', type: 'alert'});

    if (!usersLoaded) {
      socket.emit('getUsers', {}, function (err, users) {
        console.log(err, users);
        $scope.users = users;
        // $scope.issues = [];

        test = users;
        // console.log($);
        // console.log($('#content'));
        // console.log($('.user'));
        $scope.$watch($scope.users, function(){
          console.log("user changed", $scope.users);
          $('#content').isotope({
            itemSelector : '.user'
          });
          $isotope = $('#content').data('isotope');
          // $isotope.reLayout();
          usersLoaded = true;
          noty({text: 'Users Loaded', layout: 'topRight', timeout:3000});
        });

        socket.emit('getIssues', {}, function (err, issues) {
          // console.log('issues', issues);
          $scope.issues = issues;
          for (var i = issues.length - 1; i >= 0; i--) {
            var issue = issues[i];
            // console.log('issue', issue);

            if (issue.assigned_to.hasOwnProperty('id')) {
              var user = search($scope.users, 'id', issue.assigned_to.id);
              if (!!user) {
                // console.log('user', user);
                if (!user.hasOwnProperty('issues')) {
                  user.issues = [];
                }
                user.issues.push(issue);
              }
            }
          }
          // $scope.$watch($scope.issues, function(){
          //   console.log("issues changed", $scope.issues);
          //   $isotope.reLayout();
          //   noty({text: 'Users Loaded', layout: 'topRight', timeout:1000});
          // });

          noty({text: 'Issues Loaded', layout: 'topRight', timeout:3000});
        });
      });
    }

    socket.on('currentIssueUpdated', function(data){
      // console.log(data.login, " updateCurrentIssueThux data : ", data);
      // console.log("users : ", $scope.users);
      // var user = $scope.users[data.login];
      var user = search($scope.users, 'login', data.login);
      // console.log("user : ", user);
      user.issueId = data.issueId;
      user.issueName = data.issueName;
      user.issueStatus = data.issueStatus;
      user.issueTime = data.issueTime;
      user.issueUrl = data.issueUrl;
      $isotope.reLayout();
    });

    socket.on('updateIssue', function(updatedIssue){
      // console.log('updatedIssue', updatedIssue.assigned_to.name);
      console.log('updatedIssue', updatedIssue);
      test = updatedIssue;

      var issue = search( $scope.issues, 'id', updatedIssue.id);
      var issueIndex = $scope.issues.indexOf(issue);
      // console.log('issue', issue.assigned_to.name);
      console.log('issue', issue);
      noty({text:'updating issue ' + updatedIssue.id, layout: 'topRight', timeout:3000});
      noty({text:'from ' + issue.assigned_to.name, layout: 'topRight', timeout:3000});
      noty({text:'to ' + updatedIssue.assigned_to.name, layout: 'topRight', timeout:3000});



      var lastUser = search( $scope.users, 'id', issue.assigned_to.id);

      if (!!lastUser) {
        // console.log('lastUser.issues.indexOf(issue)', lastUser.issues.indexOf(issue));
        lastUser.issues.splice(lastUser.issues.indexOf(issue), 1);
        // console.log('lastUser', lastUser.name);
      }

      // issue = updatedIssue;
      $scope.issues.splice(issueIndex, 1);
      $scope.issues.push(updatedIssue);

      var newUser = search($scope.users, 'id', updatedIssue.assigned_to.id);
      if (!!newUser) {
        newUser.issues.push(updatedIssue);
        // console.log('newUser', newUser.name);
      };
    });

    socket.on('createIssue', function createIssue (newIssue){
      console.log('newIssue', newIssue);
      $scope.issues.push(newIssue);
      var user = search($scope.users, 'id', newIssue.assigned_to.id);
      user.issues.push(newIssue);
      console.log('user', user);
    });

    socket.on('log', function(source, data){
      logData = data;
      console.group("source : ", source);
      console.log("data : ", data);
      console.groupEnd();
    });
  });

  $scope.testIssueUpdate = function testIssueUpdate () {
    console.log('start testIssueUpdate');
    issue = search(root.scope().issues, 'id', 7922);


    noty({text:'updating issue ' + issue.id, layout: 'topLeft', timeout:3000});
    noty({text:'from ' + issue.assigned_to.name, layout: 'topLeft', timeout:3000});

    console.log('testIssueUpdate issue : ', issue);
    socket.emit('testIssueUpdate', issue.assigned_to, function(){
      console.log('stop testIssueUpdate');
    });
  };

  $scope.checkLastIssue = function checkLastIssue () {
    console.log('start checkLastIssue');

    socket.emit('checkLastIssue', {}, function(){
      console.log('stop checkLastIssue');
    });
  };

  console.log('$scope : ', $scope);

}


function MyCtrl1($scope, socket) {
  socket.on('send:time', function (data) {
    $scope.time = data.time;
  });
}
MyCtrl1.$inject = ['$scope', 'socket'];


function MyCtrl2() {
}
MyCtrl2.$inject = [];
