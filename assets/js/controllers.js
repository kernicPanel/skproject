// 'use strict';

/* Controllers */

      console.log(jQuery('#content'));
function AppCtrl($scope, socket, ng) {
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
            // options
            itemSelector : '.user'
            //layoutMode : 'fitRows',
            // getSortData : {
            //   name : function ( $elem ) {
            //     return $elem.find('.name').text();
            //   },
            //   count : function ( $elem ) {
            //     return parseInt($elem.find('.count').text(), 10);
            //   }
            // },
            // sortBy : 'name'
          });
          $isotope = $('#content').data('isotope');
          // $isotope.reLayout();
      });
    });

    socket.on('updateCurrentIssue::response', function(data){
        // console.log(data.login, " updateCurrentIssueThux data : ", data);
        // console.log("users : ", $scope.users);
        var user = ng.$filter('filter')($scope.users, data.login);
        console.log("user : ", user);
    });

    socket.on('log', function(data){
        console.log("data : ", data);
    });
  });

  // $scope.getIssues = function(user) {
  //   console.log(this);
  //   test = this;
  //   if (!user.hasOwnProperty('issues')) {
  //     socket.emit('getUserIssues', user.id, function (err, data) {
  //       // console.log(err, data);
  //       console.log('userIssue : ', data);
  //       user.issues = data;
  //     });
  //   }
  // };

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
