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

/* Directives */


angular.module('realTeam.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]).
  directive('users', function() {
    return function(scope, element, attrs) {
      scope.usersOrder = 'name';
    };
  }).
  directive('userIssues', function(socket, $timeout, dateFilter){
    return function(scope, element, attrs) {
      scope.issuesOrder = '-priority.id';

      $(element).find('.issues').hide();

      $(element).find('.showIssues').on('click', function(){
        var user = scope.user;
        if (!user.hasOwnProperty('issues')) {
          socket.emit('getUserIssues', user.id, function (err, issues) {
            user.issues = issues;
          });
        }
        $(this).toggleClass('badge')
          .find('i').toggleClass('icon-chevron-right icon-chevron-down');

        $(element).toggleClass('span4 span12')
          .find('.issues').slideToggle('fast', function () {
            $isotope.reLayout(function () {
              $.scrollTo($(element).offset().top - 50, 400);
            });
          });
      });

      scope.$watch(scope.user, function() {
        $isotope.reLayout();
      });
    };
  }).
  directive('issue', function(socket){
    return function(scope, element, attrs) {

      var issue = scope.issue;

      $(element).find('.showIssue').on('click', function(){
        $(element).find('.issueContent').slideToggle('fast', function () {
          $isotope.reLayout(function () {
            // $.scrollTo($(element).offset().top - 50, 400);
          });
        });
      });

      $(element).find('.journals').hide();

      $(element).find('.showJournal').on('click', function(){
        var issue = scope.issue;
        if (!issue.hasOwnProperty('journals')) {
          socket.emit('getCompleteIssue', issue.id, function (err, completeIssue) {
            issue.journals = completeIssue.journals;
          });
        }
        $(element).find('.journals').slideToggle('fast', function () {
          $isotope.reLayout(function () {
            // $.scrollTo($(element).offset().top - 50, 400);
          });
        });

        $(element).find('.issues').slideToggle('fast', function () {
          $isotope.reLayout();
        });
      });

    };
  }).
  directive('timer', function(socket){
    return function(scope, element, attrs) {

      var issue = scope.issue;

      $(element).find('.start').on('click', function(){
        noty({text: 'start issue ' + issue.id, layout: 'topRight', timeout:3000});
        socket.emit('startIssue', issue.id, function (err, data) {
        });
      });

      $(element).find('.pause').on('click', function(){
        noty({text: 'pause issue', timeout:3000});
        socket.emit('pauseIssue',{} , function (err, data) {
        });
      });

      $(element).find('.stop').on('click', function(){
        noty({text: 'stop issue', timeout:3000});
        socket.emit('stopIssue', {}, function (err, data) {
        });
      });
    };
  }).
  directive('journal', function(socket){
    return function(scope, element, attrs) {

      var notes = $(element).find('.notes');

      scope.$watch(scope.journal, function() {
        notes.html(notes.text());
        $isotope.reLayout();
      });
    };
  }).
  directive('admin', function(socket){
    return function(scope, element, attrs) {

      $(element).find('#sync').on('click', function(){
        socket.emit('sync', {}, function (err, data) {
        });
        return false;
      });

      $(element).find('#setusers').on('click', function(){
        socket.emit('setUsersIssues', {}, function (err, data) {
        });
      });

      $(element).find('#setprojects').on('click', function(){
        socket.emit('setSkProjects', {}, function (err, data) {
        });
      });

    };
  });

