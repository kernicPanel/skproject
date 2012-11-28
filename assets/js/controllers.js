/*

Copyright (c) 2012 Nicolas Clerc <kernicpanel@nclerc.fr>

This file is part of redLive.

redLive is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

redLive is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with redLive.  If not, see <http://www.gnu.org/licenses/>.

*/

// 'use strict';

/* Controllers */

function TeamCtrl($scope, socket, search) {
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

        // for (var i = users.length - 1; i >= 0; i--) {
        //   user = users[i];
        //   if (user.hasOwnProperty('currentTask')) {
        //     console.log('user', user);
        //     user.currentTask.issueTime = moment(user.currentTask.startedAt).fromNow();
        //   }
        // }
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

          noty({
            text: 'Users Loaded',
            layout: 'topRight',
            timeout:3000,
            callback: {
              afterShow: function() {
                $isotope.reLayout();
              }
            },
          });
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

            noty({
              text: 'Issues Loaded',
              layout: 'topRight',
              timeout:3000,
              callback: {
                afterShow: function() {
                  $isotope.reLayout();
                }
              },
            });
        });
      });

      socket.on('currentIssueUpdated', function(data){
        // console.log(data.login, " updateCurrentIssueThux data : ", data);
        // console.log("users : ", $scope.users);
        // var user = $scope.users[data.login];
        var user = search($scope.users, 'login', data.login);
        // user.issueId = data.issueId;
        // user.issueName = data.issueName;
        // user.issueStatus = data.issueStatus;
        // user.issueTime = data.issueTime;
        // user.issueUrl = data.issueUrl;
        user.currentTask = data;
        // console.log("user : ", user);
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
    }
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

function AdminCtrl($scope, socket, search) {

  socket.on('redlive::connect', function (data){
    console.log('redlive::connect');
    noty({text: 'Socket Connected', timeout:3000});
  });

}

function CommonCtrl($scope, socket, search) {

  var messages = $scope.messages = {};

  socket.on('syncStart', function (message){
    // systemNotif = noty({text: message, layout: 'center'});
    // console.log('syncStart', message);
    messages[message.type] = message;
  });

  socket.on('syncPending', function (message){
    // systemNotif = noty({text: progress, layout: 'center'});
    // console.log('syncPending', message);
    messages[message.type] = message;
  });

  socket.on('syncDone', function (message){
    noty({text: message.type + ' ' + message.text, layout: 'topRight', timeout:3000});
    // console.log('syncDone', messages);
    // $scope.message = null;
    // console.log('messages[message.type]', messages[message.type]);
    delete messages[message.type];
    // console.log('messages[message.type]', messages[message.type]);
  });

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
