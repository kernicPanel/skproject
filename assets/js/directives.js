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
    // ajouter timer
    // voir exemples de directives


    return function(scope, element, attrs) {
      scope.issuesOrder = '-priority.id';
      var user = scope.user;

      $(element).on("tick", function () {
        if (user.currentTask && !user.currentTask.paused) {
          // console.log('tick', user);
          user.currentTask.pendingTimeCounter = user.currentTask.pendingDuration + (new Date() - new Date(user.currentTask.startedAt));
          user.currentTask.pendingTimeCounter += 1000;
          var pendingTimeCounter = user.currentTask.pendingTimeCounter;
          user.currentTask.timeCounter = dateFilter((pendingTimeCounter - 60 *60 * 1000), "H'h 'mm'm 'ss's'" ) + ' (' + pendingTimeCounter +' ms)' + ' (' + pendingTimeCounter / 1000 / 60 / 60 + ' h)';
        }
      });

      $(element).find('.issues').hide();

      $(element).find('.showIssues').on('click', function(){
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

      $(element).find('.addtime').on('click', function(){
        noty({text: 'addtime issue ', layout: 'topRight', timeout:3000});
        // socket.emit('startIssue', issue.id, function (err, data) {});
        $('#addtime').modal('show');
        console.log('+ scope', scope.$parent.issue.id);
        console.log('+ scope', scope.$parent.issue);

        var issue = scope.$parent.issue;
        var addtimeIssue = {
          id: issue.id,
          issueName: issue.subject,
          issueUrl: issue.url,
          hours: 0,
          minutes: 0
        };

        angular.element($('#addtime')).scope().issue = addtimeIssue;
      });

    };
  }).
  directive('addtime', function(socket){
    return function(scope, element, attrs) {

      var $element = $(element);
      // scope.issue = 'init';

      $element.modal({
        show: false
      });

      // (15895800 - (((15895800 / 1000 / 60) % 60) * 60 * 1000)) / 1000 / 60 / 60 + ' h ' + Math.round((15895800 / 1000 / 60) % 60) + ' mn';


      // scope.$watch(scope.issue, function () {
      //   var issue = scope.issue;
      //   issue.hours = formatTime(issue.pendingDuration);
      // });

      $element.find('#sendAddtime').on('click', function (){
        // console.log('element', element);
        // console.log('modal scope', scope);

        console.log("scope.issue", scope.issue);
        socket.emit('addTime', scope.issue, function (err, data) {
          console.log("err", err);
          console.log("data", data);
          $element.modal('hide');
          var time_entry = data.time_entry;
          noty({
            text: 'issue ' + time_entry.issue.id + ' addtime ' + Math.round(time_entry.hours * 100) / 100,
            layout: 'topRight',
            timeout:3000
          });
        });
      });

      // scope.addtime = $element;

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
        socket.emit('redmineStats::sync', {}, function (err, data) {
        });
        return false;
      });

      $(element).find('#fetchUsers').on('click', function(){
        socket.emit('fetchRedmineUsers', {}, function (err, data) {
        });
      });

      $(element).find('#createTeam').on('click', function(){
        socket.emit('createTeam', {}, function (err, data) {
        });
      });

      $(element).find('#createProjects').on('click', function(){
        socket.emit('createProjects', {}, function (err, data) {
        });
      });

    };
  });

