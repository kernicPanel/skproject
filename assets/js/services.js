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
          result.push(element);
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
  factory('tick', function ($timeout) {

    var tick = function tick() {
      timeoutId = $timeout(function() {
        // console.log('tick');
        $.event.trigger({
          type: "tick"
        });
        tick();
      }, 1000);
    };

    tick();

  });

root = angular.element(document.getElementById('content'));
scope = root.scope();
