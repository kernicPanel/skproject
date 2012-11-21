// 'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('redLive.services', []).
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
  });

root = angular.element(document.getElementById('content'));
scope = root.scope();
// search = root.injector().get('search');
