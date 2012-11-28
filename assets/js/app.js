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


// Declare app level module which depends on filters, and services
var app = angular.module('redLive', ['redLive.filters', 'redLive.services', 'redLive.directives', 'ng']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/view1', {templateUrl: 'partials/partial1', controller: MyCtrl1});
    $routeProvider.when('/view2', {templateUrl: 'partials/partial2', controller: MyCtrl2});
    $routeProvider.otherwise({redirectTo: '/view1'});
    $locationProvider.html5Mode(true);
  }]);