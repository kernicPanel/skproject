/*

Copyright (c) 2012 Nicolas Clerc <kernicpanel@nclerc.fr>

This file is part of redLive.

redLive is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

redLive is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with redLive.  If not, see <http://www.gnu.org/licenses/>.

*/

// 'use strict';

/* Directives */


angular.module('redLive.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]).
  directive('users', function() {
    return function(scope, element, attrs) {
      scope.usersOrder = 'name';

      // $(element).isotope({
      //   itemSelector : '.user',
      //   getSortData : {
      //     name : function ( $elem ) {
      //       return $elem.find('.name').text();
      //     },
      //     count : function ( $elem ) {
      //       return parseInt($elem.find('.count').text(), 10);
      //     }
      //   },
      //   sortBy : 'name'
      // });
      // $isotope = $(element).data('isotope');

    };
  }).
  directive('userIssues', function(socket){
    // console.log('socket : ', socket);

    return function(scope, element, attrs) {

      // console.log('scope : ', scope);
      // console.log('element : ', element);
      // console.log('attrs : ', attrs);

      scope.issuesOrder = '-priority.id';
      // scope.issueOrder = 'subject';

      $(element).find('.issues').hide();

      $(element).find('.showIssues').on('click', function(){
        console.log(this);
        var user = scope.user;
        if (!user.hasOwnProperty('issues')) {
          socket.emit('getUserIssues', user.id, function (err, issues) {
            console.log('issues', issues);
            console.log('scope', scope);
            user.issues = issues;
            // scope.$parent.issues = scope.$parent.issues.concat(issues);
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
        // element.isotope();
        // $isotope.reLayout();
      });

      // $(element).on('click', function(){
      //   console.log(this);
      // });
    };
  }).
  directive('issue', function(socket){
    return function(scope, element, attrs) {

      var issue = scope.issue;

      $(element).find('.showIssue').on('click', function(){
        $(element).find('.issueContent').slideToggle('fast', function () {
          $isotope.reLayout(function () {
            $.scrollTo($(element).offset().top - 50, 400);
          });
        });
      });


      // scope.$watch(scope.issue, function watchUserIssue() {
      //   var description = $(element).find('.desc');
      //   description.html(description.text());
      //   $isotope.reLayout();
      // });

      $(element).find('.journals').hide();

      $(element).find('.showJournal').on('click', function(){
        console.log('scope.issue', scope.issue);
        var issue = scope.issue;
        if (!issue.hasOwnProperty('journals')) {
          socket.emit('getCompleteIssue', issue.id, function (err, completeIssue) {
            issue.journals = completeIssue.journals;
            console.log('journals', completeIssue.journals);

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

      // console.log('scope : ', scope);
      // console.log('element : ', element);
      // console.log('attrs : ', attrs);
      var issue = scope.issue;

      $(element).find('.start').on('click', function(){
        console.log(scope);
        noty({text: 'start issue ' + issue.id, layout: 'topRight', timeout:3000});
        socket.emit('startIssue', issue.id, function (err, data) {
          console.log('err : ', err);
          console.log('data : ', data);
        });
      });

      $(element).find('.pause').on('click', function(){
        console.log(this);
        noty({text: 'pause issue', timeout:3000});
        socket.emit('pauseIssue',{} , function (err, data) {
          console.log('err : ', err);
          console.log('data : ', data);
        });
      });

      $(element).find('.stop').on('click', function(){
        console.log(this);
        noty({text: 'stop issue', timeout:3000});
        socket.emit('stopIssue', {}, function (err, data) {
          console.log('err : ', err);
          console.log('data : ', data);
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
        console.log('element', element);
        socket.emit('sync', {}, function (err, data) {
            console.log('redmine::sync', err);
            console.log('redmine::sync', data);
        });
        return false;
      });

      $(element).find('#setusers').on('click', function(){
        socket.emit('setUsersIssues', {}, function (err, data) {
            console.log('setUsersIssues', err);
            console.log('setUsersIssues', data);
        });
      });

      $(element).find('#setprojects').on('click', function(){
        socket.emit('setSkProjects', {}, function (err, data) {
            console.log('setSkProjects', err);
            console.log('setSkProjects', data);
        });
      });

    };
  });

