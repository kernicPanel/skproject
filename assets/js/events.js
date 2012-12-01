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

console.log("events : ");
var eventsManager = app.eventsManager = {};
    eventsManager.socket = io.connect();

// Mixin
_.extend(eventsManager, Backbone.Events);

// Add a custom event
eventsManager.on("startEvent", function(issueId, callback){
  console.log("We triggered " + issueId);
  eventsManager.socket.emit('redmine::startIssue', issueId, function (err, data) {
    console.log("start : ", data);
    callback(err, data);
  });
});

//
//Events
//
$('#sync').click(function() {
  eventsManager.socket.emit('redmine::sync', function (data) {
    console.log(data);
  });
});

$('#setusers').click(function() {
  eventsManager.socket.emit('setUsersIssues', function (err, data) {
    console.log('setUsers click', data);
  });
});

$('#getusers').click(function() {
  //skuserView.remove();
  eventsManager.socket.emit('getUsers', function (data) {
    console.log(data);
  });
});

$('#setprojects').click(function() {
  console.log("setprojects : ");
  eventsManager.socket.emit('setSkProjects', function (data) {
    console.log(data);
  });
});

$('#getprojects').click(function() {
  //skuserView.remove();
  eventsManager.socket.emit('getSkProjects', function (data) {
    console.log(data);
  });
});


eventsManager.socket.on('redmine::connect', function(data){
  console.log("redmine connect : ");
  eventsManager.socket.emit('getUsers', function (err, data) {
    //console.log(err, data);
    app.views.skuserView.addUsers(data);
  });

  eventsManager.socket.emit('getIssues', function (err, data) {
    //console.log(err, data);
    app.collections.issueList.addIssues(data);
  });

  eventsManager.socket.on('updateCurrentIssue::response', function(data){
    //console.log(data.login, " updateCurrentIssueThux data : ", data);
    app.views.skuserView.updateCurrentIssueThux(data);
  });

  eventsManager.socket.on('getSkProjects::response', function(data){
    //console.log("data : ", data);
    app.views.skprojectView.addProjects(data);
  });

  eventsManager.socket.on('updateIssue', function (issue) {
    console.log('updateIssue : ', issue);
    //app.collections.issueList.updateIssue(issue);
    app.views.skuserView.updateIssue(issue);
  });

  eventsManager.socket.on('createIssue', function (data) {
    console.log('createIssue : ', data);
  });

  eventsManager.socket.on('log', function(data){
    console.log("data : ", data);
  });

});
