// 'use strict';

/* Controllers */

      console.log(jQuery('#content'));
function AppCtrl($scope, socket) {
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
        });
      });
    }

    socket.on('currentIssueUpdated', function(data){
      // console.log(data.login, " updateCurrentIssueThux data : ", data);
      // console.log("users : ", $scope.users);
      // var user = $scope.users[data.login];
      var user = search($scope.users, 'login', data.login);
      user.issueId = data.issueId;
      user.issueName = data.issueName;
      user.issueStatus = data.issueStatus;
      user.issueTime = data.issueTime;
      user.issueUrl = data.issueUrl;
    });

    socket.on('log', function(source, data){
        console.group("source : ", source);
        console.log("data : ", data);
        console.groupEnd();
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
