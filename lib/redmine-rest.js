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

var https = require('https');
var util = require('util');
var url = require('url');
var querystring = require('querystring');

function escapeJSONString(key, value) {
  if (typeof value == 'string') {
    return value.replace(/[^ -~\b\t\n\f\r"\\]/g, function(a) {
       //"
      return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    });
  }
  return value;
}
function JSONStringify(data) {
  return JSON.stringify(data, escapeJSONString).replace(/\\\\u([\da-f]{4}?)/g, '\\u$1');
}

/**
 *  Redmine
 */
function Redmine(config) {
  if (!config.apiKey || !config.host) {
    throw new Error("Error: apiKey and host must be configured.");
  }

  this.setApiKey(config.apiKey);
  this.setHost(config.host);
}

Redmine.prototype.version = '0.2.3';

Redmine.JSONStringify = JSONStringify;

Redmine.prototype.setApiKey = function(key) {
  this.apiKey = key;
};

Redmine.prototype.getApiKey = function() {
  return this.apiKey;
};

Redmine.prototype.setHost = function(host) {
  this.host = host;
};

Redmine.prototype.getHost = function() {
  return this.host;
};

Redmine.prototype.generatePath = function(path, params) {
  if (path.slice(0, 1) != '/') {
    path = '/' + path;
  }
  //console.log("path : ", path + '?' + querystring.stringify(params));
  return path + '?' + querystring.stringify(params);
};

Redmine.prototype.request = function(method, path, params, callback, addData) {
  addData = addData || false;

  //console.log("method : ", method);
  //console.log("path : ", path);
  //console.log("params : ", params);
  //console.log("callback : ", callback);
  //console.log("addData : ", addData);

  if (!this.getApiKey() || !this.getHost()) {
    throw new Error("Error: apiKey and host must be configured.");
  }

  var options = {
    host: this.getHost(),
    path: method == 'GET' ? this.generatePath(path, params) : path,
    method: method,
    headers: {
      'X-Redmine-API-Key': this.getApiKey()
    },
    rejectUnauthorized: false
  };

   //console.log("options : ", options);
   //console.log("options request : ", options.path);

  var req = https.request(options, function(res) {
    //console.log('STATUS: ' + res.statusCode);
    //console.log('HEADERS: ' + JSON.stringify(res.headers));

    if (res.statusCode != 200 && res.statusCode != 201) {
      callback({message: 'Server returns stats code: ' + res.statusCode, response: res}, null);
      callback = null;
      return ;
    }

    var body = "";
    // res.setEncoding('utf8');
    res.on('data', function (chunk) {
      // chunk = chunk.replace(/\u0015/g, '');
      body += chunk;
    });
    res.on('end', function(e) {
      // console.log("body res : ", body);
      body = body.replace(/\u0015/g, '');
      // body = body.replace('<script', '«script');
      var data = JSON.parse(body);
      callback(null, data, addData);
      callback = null;
    });
  });

  req.on('error', function(err) {
    callback(err, null);
    callback = null;
  });

  if (method != 'GET') {
    var body = JSONStringify(params);
    req.setHeader('Content-Length', body.length);
    req.setHeader('Content-Type', 'application/json');
    req.write(body);
  }
  req.end();
};

/**
 *  crud apis
 */
Redmine.prototype.getItems = function(type, params, callback) {
  this.request('GET', '/' + type + '.json', params, callback);
};

Redmine.prototype.getIssueParams = function(id, params, callback) {
  if (typeof id == 'integer') {
    throw new Error('Error: Argument #1 id must be integer');
  }
  this.request('GET', '/issues/' + id + '.json', params, callback);
};

Redmine.prototype.getIssueParamsAddData = function(id, params, callback, addData) {
  if (typeof id == 'integer') {
    throw new Error('Error: Argument #1 id must be integer');
  }
  this.request('GET', '/issues/' + id + '.json', params, callback, addData);
};

Redmine.prototype.getTimeEntriesParamsAddData = function(params, callback, addData) {
  this.request('GET', '/time_entries.json', params, callback, addData);
};

Redmine.prototype.getTimeEntry = function(id, callback, addData) {
  this.request('GET', '/time_entries/' + id + '.json', {}, callback, addData);
};

Redmine.prototype.getIssue = function(id, callback) {
  if (typeof id == 'integer') {
    throw new Error('Error: Argument #1 id must be integer');
  }
  this.request('GET', '/issues/' + id + '.json', {}, callback);
};

Redmine.prototype.getIssues = function(params, callback) {
  this.request('GET', '/issues.json', params, callback);
};

Redmine.prototype.postIssue = function(params, callback) {
  this.request('POST', '/issues.json', {issue: params}, callback);
};

Redmine.prototype.updateIssue = function(id, params, callback) {
  this.request('PUT', '/issues/' + id + '.json', {issue: params}, callback);
};

Redmine.prototype.deleteIssue = function(id, callback) {
  this.request('DELETE', '/issues/' + id + '.json', {}, callback);
};

Redmine.prototype.getProject = function(id, callback) {
  if (typeof id == 'integer') {
    throw new Error('Error: Argument #1 id must be integer');
  }
  this.request('GET', '/project/' + id + '.json', {}, callback);
};

Redmine.prototype.getProjects = function(params, callback) {
  this.request('GET', '/projects.json', params, callback);
};

Redmine.prototype.getUser = function(id, callback) {
  if (typeof id == 'integer') {
    throw new Error('Error: Argument #1 id must be integer');
  }
  this.request('GET', '/user/' + id + '.json', {}, callback);
};

Redmine.prototype.getUsers = function(params, callback) {
  this.request('GET', '/users.json', params, callback);
};

Redmine.prototype.getUserFromKey = function(params, callback) {
  //console.log("params : ", params);
  this.request('GET', '/users/current.json', params, callback);
};


/*
 * Exports
 */
module.exports = Redmine;
