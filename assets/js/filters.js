// 'use strict';
//
/* Filters */

angular.module('myApp.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]);


function search(array, attr, val) {
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
  return result;
}
