// 'use strict';

/* Controllers */

      console.log(jQuery('#content'));
function AppCtrl($scope, socket) {
  socket.on('send:name', function (data) {
    $scope.name = data.name;
  });

  socket.on('redmine::connect', function (data){

    socket.emit('getUsers', {}, function (err, users) {
      console.log(err, users);
      $scope.users = users;
      // console.log($);
      // console.log($('#content'));
      // console.log($('.user'));
      $scope.$watch($scope.users, function(){
          console.log("user changed");
          $('#content').isotope({
            itemSelector : '.user'
          });
          $isotope = $('#content').data('isotope');
          // $isotope.reLayout();
      });
    });

    socket.on('updateCurrentIssue::response', function(data){
      // console.log(data.login, " updateCurrentIssueThux data : ", data);
      // console.log("users : ", $scope.users);
      var user = $scope.users[data.login];
      user.issueId = data.issueId;
      user.issueName = data.issueName;
      user.issueStatus = data.issueStatus;
      user.issueTime = data.issueTime;
      user.issueUrl = data.issueUrl;
    });

    socket.on('log', function(data){
        console.log("data : ", data);
    });
  });

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
