/*
Copyright (c) 2012 Sotaro KARASAWA <sotarok@crocos.co.jp>
Modified by Nicolas Clerc <kernicpanel@nclerc.fr>

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

var request = require('request');

var host = server.config.gitlab.host;
var apiKey = server.config.gitlab.apiKey;

var gitlabRest ={
  init: function init(host, apiKey){
  },
  projects: {
    id: function projectsAll(id, cb) {
      var url = host + "/projects/" + id + "?private_token=" + apiKey;
      console.log('url', url);
      request.get({url: url, json:true}, function (error, response, body) {
        cb(error, body);
      })
    },
    all: function projectsAll(cb) {
      var url = host + "/projects?private_token=" + apiKey;
      console.log('url', url);
      request.get({url: url, json:true}, function (error, response, body) {
        cb(error, body);
      })
    }
  },
  mergeRequest: {
    get: function mergeRequestGet(projectId, mergeRequestId, cb) {
      var url = host + "/projects/" + projectId + "/merge_request/" + mergeRequestId + "?private_token=" + apiKey;
      console.log('url', url);
      request.get({url: url, json:true}, function (error, response, body) {
        cb(error, body);
      })
    }
  },
  user: {
    id: function projectsAll(id, cb) {
      var url = host + "/users/" + id + "?private_token=" + apiKey;
      console.log('url', url);
      request.get({url: url, json:true}, function (error, response, body) {
        cb(error, body);
      })
    }
  }
};


module.exports = gitlabRest;
