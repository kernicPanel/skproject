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

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('realTeam.services', []).
  value('version', '0.1').
  factory('socket', function ($rootScope) {
    var socket = io.connect();
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
        // socket.emit(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        });
      }
    };
  }).
  factory('search', function ($rootScope) {
    // return function (array, attr, val) {
    search =  function (array, attr, val) {
      var result = [];
      array.forEach(function(element, index) {
        if (element[attr] === val) {
          // console.log('array[index]', array[index]);
          // console.log('element[attr]', element[attr]);
          // console.log('array', array);

          result.push(element);
          // return array[index];
        }
      });
      if (result.length === 1) {
        result = result[0];
      }
      else if (result.length === 0) {
        result = false;
      }
      return result;
    };
    return search;
  }).
  factory('timer', function ($rootScope, $timeout, dateFilter) {
    var timeoutId = false;
    var pendingTime = 0;
    var pendingTimeCounter = 0;
    // var updateTime = function updateTime(user, pendingTimeCounter) {
    var updateTime = function updateTime(user) {
      // // console.log('pendingTimeCounter', pendingTimeCounter);
      // pendingTimeCounter = pendingTimeCounter || pendingTime;
      // // console.log('pendingTimeCounter default', pendingTimeCounter);
      // // console.log('updateTime', user.currentTask);
      // var now = new Date();
      // var startedDate = new Date(user.currentTask.startedAt);
      // var dateDiff = (now - startedDate)-60*60*1000;
      // // console.log('updateTime', dateDiff);
      // dateDiff += pendingTimeCounter;
      // // console.log('updateTime', pendingTimeCounter);
      // // console.log('updateTime', dateDiff);
      // // var dateDiff = user.currentTask.timeCounter;
      // // user.currentTask.timeCounter = dateFilter(dateDiff, "H'h 'mm'm 'ss's'" ) + dateDiff;
      user.currentTask.timeCounter = dateFilter((pendingTimeCounter - 60 *60 * 1000), "H'h 'mm'm 'ss's'" ) + ' (' + pendingTimeCounter +' ms)' + ' (' + pendingTimeCounter / 1000 / 60 / 60 + ' h)';
    };

    // schedule update in one second
    var updateLater = function updateLater(user) {
      // save the timeoutId for canceling
      timeoutId = $timeout(function() {
        pendingTimeCounter += 1000;
        updateTime(user); // update DOM
        updateLater(user); // schedule another update
      }, 1000);
    };


    return {
      init: function (user) {
        // console.log('timer init', user);
        pendingTimeCounter = user.currentTask.pendingTimeCounter;
        if (user.currentTask.paused) {
          updateTime(user);
        }
        else {
          updateLater(user);
        }
      },
      start: function (user) {
        // console.log('timer start', user);
        $timeout.cancel(timeoutId);
        pendingTimeCounter = 0;
        updateLater(user);
      },
      pause: function (user) {
        // console.log('timer pause', user, timeoutId);
        if (!!timeoutId) {
          // user.currentTask.issueStatus = 'en pause';
          $timeout.cancel(timeoutId);
          timeoutId = false;
          updateTime(user);
        }
        else {
          // user.currentTask.issueStatus = 'en cours';
          updateLater(user);
        }
      },
      stop: function (user) {
        pendingTimeCounter = 0;
        $timeout.cancel(timeoutId);
        // console.log('timer stop', user);
      }
    };
  });

root = angular.element(document.getElementById('content'));
scope = root.scope();
// search = root.injector().get('search');
