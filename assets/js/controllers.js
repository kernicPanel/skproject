/*

Copyright (c) 2012 Nicolas Clerc <kernicpanel@nclerc.fr>

This file is part of realTeam.

realTeam is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

realTeam is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with realTeam.  If not, see <http://www.gnu.org/licenses/>.

*/

// 'use strict';

/* Controllers */

function TeamCtrl($scope, socket, search, timer, $timeout) {
  socket.on('send:name', function (data) {
    $scope.name = data.name;
  });

  var usersLoaded = false;

  socket.on('realTeam::connect', function (data){
    console.log('realTeam::connect');
    noty({text: 'Socket Connected', timeout:3000});

    if (!usersLoaded) {
      socket.emit('getUsers', {}, function (err, users) {
        $scope.users = users;
        $scope.$watch($scope.users, function(){
          $('#content').isotope({
            itemSelector : '.user'
          });
          $isotope = $('#content').data('isotope');
          usersLoaded = true;

          noty({
            text: 'Users Loaded',
            layout: 'topRight',
            timeout:3000
          });

          $timeout(function (scope) {
            $isotope.reLayout();
          });
        });

        socket.emit('getCurrentIssues', {}, function (err, issues) {
        });

        socket.on('getCurrentIssues::response', function (issue) {
          var user = search($scope.users, 'login', issue.username);
          console.log('getCurrentIssues::response', issue.username);
          user.currentTask = issue.currentTask;
          timer.init(user);
        });

        socket.emit('getIssues', {}, function (err, issues) {
          $scope.issues = issues;
          for (var i = issues.length - 1; i >= 0; i--) {
            var issue = issues[i];

            if (issue.assigned_to.hasOwnProperty('id')) {
              var user = search($scope.users, 'id', issue.assigned_to.id);
              if (!!user) {
                if (!user.hasOwnProperty('issues')) {
                  user.issues = [];
                }
                user.issues.push(issue);
              }
            }
          }

          noty({
            text: 'Issues Loaded',
            layout: 'topRight',
            timeout:3000
          });
          $timeout(function (scope) {
            $isotope.reLayout();
          });
        });
      });

      socket.on('irc::currentIssueUpdated', function(data){
        var user = search($scope.users, 'login', data.login);
        if (!user.ircCurrentTask ||
            user.ircCurrentTask.issueId !== data.issueId ||
            user.ircCurrentTask.issueStatus !== data.issueStatus ||
            user.ircCurrentTask.issueTime !== data.issueTime) {
          user.ircCurrentTask = data;
          if (!!user.ircCurrentTask.issueName) {
            $timeout(function (scope) {
              $isotope.reLayout();
            });
          }
        }
      });

      socket.on('startCurrentIssue', function(currentTask){
        var user = search($scope.users, 'login', currentTask.login);
        user.currentTask = currentTask;
        $timeout(function (scope) {
          $isotope.reLayout();
          timer.start(user);
        });
      });

      socket.on('pauseCurrentIssue', function(currentTask){
        var user = search($scope.users, 'login', currentTask.login);
        user.currentTask = currentTask;
        timer.pause(user, currentTask.pendingTimeCounter);
      });

      socket.on('stopCurrentIssue', function(username){
        var user = search($scope.users, 'login', username);
        user.currentTask = {};
        timer.stop(user);
        $timeout(function (scope) {
          $isotope.reLayout();
        });
      });

      socket.on('updateIssue', function(updatedIssue){
        var issue = search( $scope.issues, 'id', updatedIssue.id);
        var issueIndex = $scope.issues.indexOf(issue);
        noty({text:'updating issue ' + updatedIssue.id, layout: 'topRight', timeout:3000});
        noty({text:'from ' + issue.assigned_to.name, layout: 'topRight', timeout:3000});
        noty({text:'to ' + updatedIssue.assigned_to.name, layout: 'topRight', timeout:3000});

        var lastUser = search( $scope.users, 'id', issue.assigned_to.id);

        if (!!lastUser) {
          lastUser.issues.splice(lastUser.issues.indexOf(issue), 1);
        }

        $scope.issues.splice(issueIndex, 1);
        $scope.issues.push(updatedIssue);

        var newUser = search($scope.users, 'id', updatedIssue.assigned_to.id);
        if (!!newUser) {
          newUser.issues.push(updatedIssue);
        }
      });

      socket.on('createIssue', function createIssue (newIssue){
        $scope.issues.push(newIssue);
        var user = search($scope.users, 'id', newIssue.assigned_to.id);
        user.issues.push(newIssue);
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
    issue = search(root.scope().issues, 'id', 7922);

    noty({text:'updating issue ' + issue.id, layout: 'topLeft', timeout:3000});
    noty({text:'from ' + issue.assigned_to.name, layout: 'topLeft', timeout:3000});

    socket.emit('testIssueUpdate', issue.assigned_to, function(){
    });
  };

  $scope.checkLastIssue = function checkLastIssue () {
    socket.emit('checkLastIssue', {}, function(){
    });
  };
}

function AdminCtrl($scope, socket, search) {

  socket.on('realTeam::connect', function (data){
    console.log('realTeam::connect');
    noty({text: 'Socket Connected', timeout:3000});
  });

}

function CommonCtrl($scope, socket, search) {

  var messages = $scope.messages = {};

  socket.on('syncStart', function (message){
    messages[message.type] = message;
  });

  socket.on('syncPending', function (message){
    messages[message.type] = message;
  });

  socket.on('syncDone', function (message){
    noty({text: message.type + ' ' + message.text, layout: 'topRight', timeout:3000});
    delete messages[message.type];
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
