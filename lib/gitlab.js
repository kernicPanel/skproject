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

console.log("»»»»»gitlab load««««««".verbose);
var gitlab ={};

if (typeof server === 'undefined') {
  console.log('fuck');
  var eventsManager = require( './eventsManager.js' );
  var mongoHost = require('./config.example.js').mongo.host;
  var host = require('./config.example.js').gitlab.host;
  var apiKey = require('./config.example.js').gitlab.apiKey;
}
else {

  var eventsManager = server.eventsManager;

  var mongoHost = server.config.mongo.host;
  if (!!process.env.VCAP_SERVICES) {
    var mongoSetup = JSON.parse(process.env.VCAP_SERVICES);

    mongoHost = mongoSetup["mongodb-1.8"][0].credentials.url;
  }

  var host = server.config.gitlab.host;
  var apiKey = server.config.gitlab.apiKey;
}

var gitlabRest = require('./gitlab-rest');

gitlab.init = function(host, apiKey){
  /*
   *gitlabRest.init(host, apiKey);
   *gitlabRest.projects.id(41, function (err, projects) {
   *  console.log('err', err);
   *  console.log('project', projects);
   *});
   */
};

server.post("/gitlab", function (req, res) {
  console.log(req.body);
  var event = req.body;
  var message = '';
  var type = !!event.boject_kind ? event.object_kind : 'push';
  if (type === 'push') {
    gitlab.onPushEvent(event);
  }
  else if (type === 'issue'){
    gitlab.onIssueEvent(event);
  }
  else if (type === 'merge_request'){
    gitlab.onMergeRequestEvent(event);
  }
  res.send(200);
});

gitlab.onPushEvent = function (event) {
  var message = '';
  message = '[' + event.repository.name + '] ';
  message += event.user_name + ' pushed ';
  message += event.total_commits_count + ' new commit';
  if (event.total_commits_count > 1) {
    message += 's';
  }
  message += ' ';
  message += 'to ' + event.ref.split('/')[2] + ' ';
  message += event.repository.homepage + '/compare/' + event.before.slice(0, 9) +'...'+ event.after.slice(0, 9) + '\n';
  /*
   *for (var i = 0, l = event.commits.length; i < l; i ++) {
   *  var commit = event.commits[i];
   *  message += commit.author.name + ' : ';
   *  message += commit.message + ' ';
   *  message += commit.url + '\n';
   *}
   */
  server.irc.broadcast(message);
};

gitlab.onIssueEvent = function (event) {
  /*
   *var message = '';
   *message = '[' + event.repository.name + '] ';
   * //message += event.user_name + ' ';
   *message += event.total_commits_count + ' new commit';
   *if (event.total_commits_count > 1) {
   *  message += 's';
   *}
   *message += ' ';
   *message += 'to ' + event.ref.split('/')[2] + '\n';
   *for (var i = 0, l = event.commits.length; i < l; i ++) {
   *  var commit = event.commits[i];
   *  message += commit.author.name + ' : ';
   *  message += commit.message + ' ';
   *  message += commit.url + '\n';
   *}
   *server.irc.broadcast(message);
   */
};

gitlab.onMergeRequestEvent = function (event) {
  var message = '';
  var projectId = event.object_attributes.target_project_id;
  var mergeIdWeb = event.object_attributes.iid;
  var mergeId = event.object_attributes.id;
  gitlabRest.projects.id(projectId, function (err, project) {
    gitlabRest.mergeRequest.get(projectId, mergeId , function (err, merge) {
      //project = JSON.parse(project);
      console.log('err', err);
      console.log('project', project.web_url);
      console.log('merge', merge);
      var mergeUrl = project.web_url + "/merge_requests/" + mergeIdWeb;
      message = '[' + project.name + '] ' + mergeId;
      message += 'Merge request ';
      message += "from " + merge.author.name +" ";
      message += "to " + merge.assignee.name +" ";
      message += merge.title +"\n";
      message += merge.source_branch + " -> " + merge.target_branch + "\n";
      message += event.object_attributes.merge_status +" ";
      message += event.object_attributes.state +"\n";
      message += mergeUrl;
      server.irc.broadcast(message);
    });
  });
};

server.post("/gitlab/push", function (req, res) {
  console.log(req.body);
  var event = req.body;
  var message = '';
  var type = !!event.object_kind ? event.object_kind : 'push';
  if (type === 'push') {
    message = '[' + event.repository.name + '] ';
    //message += event.user_name + ' ';
    message += event.total_commits_count + ' new commit';
    if (event.total_commits_count > 1) {
      message += 's';
    }
    message += ' ';
    message += 'to ' + event.ref.split('/')[2] + '\n';
    for (var i = 0, l = event.commits.length; i < l; i ++) {
      var commit = event.commits[i];
      message += commit.author.name + ' : ';
      message += commit.message + ' ';
      message += commit.url + '\n';
    }
  }
  server.irc.broadcast(message);
  res.send(200);
});

server.post("/gitlab/issues", function (req, res) {
  console.log(req.body);
  var event = req.body;
  var message = '';
  var type = !!event.object_kind ? event.object_kind : 'push';
  if (type === 'issue') {
    message = '[' + event.repository.name + '] ';
    //message += event.user_name + ' ';
    message += event.total_commits_count + ' new commit';
    if (event.total_commits_count > 1) {
      message += 's';
    }
    message += ' ';
    message += 'to ' + event.ref.split('/')[2] + '\n';
    for (var i = 0, l = event.commits.length; i < l; i ++) {
      var commit = event.commits[i];
      message += commit.author.name + ' : ';
      message += commit.message + ' ';
      message += commit.url + '\n';
    }
  }
  server.irc.broadcast(message);
  res.send(200);
});

server.post("/gitlab/merge-request", function (req, res) {
  res.set({
    'Content-Type': 'text',
    'Content-Length': 2
  })
  res.send(200);
  console.log(req.body);
  var event = req.body;
  var message = '';
  var type = !!event.object_kind ? event.object_kind : 'push';
  if (type === 'merge_request') {
    var projectId = event.object_attributes.target_project_id;
    var mergeIdWeb = event.object_attributes.iid;
    var mergeId = event.object_attributes.id;
    gitlabRest.projects.id(projectId, function (err, project) {
      gitlabRest.mergeRequest.get(projectId, mergeId , function (err, merge) {
        //project = JSON.parse(project);
        console.log('err', err);
        console.log('project', project.web_url);
        console.log('merge', merge);
        var mergeUrl = project.web_url + "/merge_requests/" + mergeIdWeb;
        message = '[' + project.name + '] ' + mergeId;
        message += 'Merge request ';
        message += "from " + merge.author.name +" ";
        message += "to " + merge.assignee.name +" ";
        message += merge.title +"\n";
        message += merge.source_branch + " -> " + merge.target_branch + "\n";
        message += event.object_attributes.merge_status +" ";
        message += event.object_attributes.state +"\n";
        message += mergeUrl;
        server.irc.broadcast(message);
      });
    });
  }
});
module.exports = gitlab;
