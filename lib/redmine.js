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

console.log("»»»»»redmine load««««««".verbose);
var redmine ={},
  Redmine = require('./redmine-rest.js'),
  mongoose = require('mongoose'),
  // textile = require('stextile');
  textile = require('textilejs');
  //textile = require('textile-js');

if (typeof server === 'undefined') {
  var eventsManager = require( './eventsManager.js' );
  var mongoHost = require('./config.example.js').mongo.host;
  var host = require('./config.example.js').redmine.host;
  var apiKey = require('./config.example.js').redmine.apiKey;
}
else {
  var eventsManager = server.eventsManager;

  var mongoHost = server.config.mongo.host;
  if (!!process.env.VCAP_SERVICES) {
    var mongoSetup = JSON.parse(process.env.VCAP_SERVICES);

    mongoHost = mongoSetup["mongodb-1.8"][0].credentials.url;
  }

  var host = server.config.redmine.host;
  var apiKey = server.config.redmine.apiKey;
}

require('./models.js');
Schema = mongoose.Schema;

var User = mongoose.model('User');
var User = mongoose.model('User');
var Issue = mongoose.model('Issue');
var TimeEntry = mongoose.model('TimeEntry');
var Project = mongoose.model('Project');
var User = mongoose.model('User');

var db = mongoose.connect(mongoHost);

var redmineRest = new Redmine({
  host: host,
  apiKey: apiKey
});

redmine.init = function() {
  redmine.syncIssues();
  redmine.events();
};

redmine.events = function() {

  eventsManager.on('redmine::checkTimeentries', function(){
    redmine.checkTimeentries();
  });

  eventsManager.on('redmine::sync', function(data){
    redmine.sync( function(err, data) {
    });
  });

  eventsManager.on('redmine::getDatabaseState', function(){
    eventsManager.emit('databaseState', {state: mongoose.connection.readyState});
  });

  eventsManager.on('redmine::fetchUsers', function(callback){
    redmine.fetchUsers( function(err, data) {
      callback(err, data);
    });
  });

  eventsManager.on('redmine::createTeam', function(callback){
    redmine.createTeam( function(err, data) {
      callback(err, data);
    });
  });

  eventsManager.on('redmine::getUsers', function(callback){
    redmine.getUsers( function(err, data) {
      callback(err, data);
    });
  });

  eventsManager.on('redmine::getIssues', function(callback){
    redmine.getIssues( function(err, data) {
      callback(null, data);
    });
  });

  eventsManager.on('redmine::getUserIssues', function(id, callback){
    redmine.getUserIssues( id, function(err, data) {
      callback(err, data);
    });
  });

  eventsManager.on('redmine::getCompleteIssue', function(id, callback){
    eventsManager.emit('log', id);
    redmine.getCompleteIssue( id, function(err, data) {
      eventsManager.emit('log', data);
      callback(err, data);
    });
  });

  eventsManager.on('redmine::getIssue', function(id, callback){
    redmine.getIssue( id, function(err, data) {
      callback(data);
    });
  });

  eventsManager.on('redmine::syncIssues', function(){
    redmine.syncIssues();
  });

  eventsManager.on('redmine::testIssueUpdate', function(currentAssignation){
    redmine.testIssueUpdate(currentAssignation);
  });

  eventsManager.on('redmine::checkLastIssue', function(){
    redmine.checkLastIssue();
  });

  eventsManager.on('stopAutoUpdate', function(){
    redmine.stopAutoUpdate();
  });

  eventsManager.on('startAutoUpdate', function(){
    redmine.startAutoUpdate();
  });

  eventsManager.on('redmine::updateCurrentIssue', function(currentIssue){
    redmine.updateCurrentIssue(currentIssue);
  });
};

redmine.sync = function( callback ) {
  redmine.getAllRedmineProjects( callback );
  redmine.getAllRedmineUsers( callback );
  redmine.getAllRedmineIssues( callback );
};

redmine.getAll = function( ItemModel, type, callback) {
  //ItemModel.collection.drop();
  eventsManager.emit('syncStart', {type: type, text: 'database sync started'});

  var itemsCount;
  var lastItem = 0;
  var itemsList = [];

  var getAllItems = function() {
    console.log("lastItem : ", lastItem);
    console.log("itemsCount : ", itemsCount);
    if (lastItem === itemsCount) {
      callback( null, itemsList );
      eventsManager.emit('syncDone', {type: type, text: 'database updated'});
      return;
    }

    redmineRest.getItems(type, {limit: 100, offset: lastItem}, function(err, data) {
      if (err) {
        console.log("error : ", err.message);
        return;
      }
      itemsCount = data.total_count;

      var items = data[type];
      var loopCount = items.length;
      for (var i = 0; i < loopCount; i++) {
        lastItem++;
        itemsList.push( items[i] );

        console.log("items[i] : ", items[i]);
        //var item = new ItemModel( items[i] );
        ItemModel.update({ id: items[i]['id'] }, items[i], { upsert: true }, function (err, numberAffected, raw) {
          //if (err) return handleError(err);
          console.log('The number of updated documents was %d', numberAffected);
          console.log('The raw response from Mongo was ', raw);
        });
        //item.redmine_id = items[i]['id'];
        //item.type_id = type + '_' + items[i]['id'];
        //console.log("item : ", item);
        eventsManager.emit('syncPending', {
          type: type,
          text: Math.round(itemsList.length / (itemsCount) * 100)
        });
        //item.save();
      }
      getAllItems();
    });
  };
  getAllItems();
  return;
};

// redmine.getAllRedmineIssues = function( callback ) {
//   redmine.getAll(Issue, 'issues', callback);
// };

redmine.fetchUsers = function( callback ) {
  redmine.getAll(User, 'users', callback);
};


// redmine.getAllRedmineProjects = function( callback ) {
//   redmine.getAll(Project, 'projects', callback);
// };


redmine.getCompleteIssue = function( id, callback ) {
  redmineRest.getIssueParams(id, {include: 'journals'}, function(err, data) {
    eventsManager.emit('log', data);

    var loopCount = data.issue.journals.length;
    for (var i = 0; i < loopCount; i++) {
        data.issue.journals[i].notes = textile(data.issue.journals[i].notes);
    }
    delete loopCount;
    callback(err, data.issue);
  });
};


redmine.createTeam = function( callback ) {

  //User.collection.drop();

  User.where('mail')
  .$regex(server.config.redmine.mailFilter)
  .each(function(err, user) {
    //eventsManager.emit('log', err);
    //eventsManager.emit('log', user);
    if (user) {
      /*
       *var user = new User({
       *  id: doc.id,
       *  type_id: doc.type_id,
       *  current: doc.current,
       *  login: doc.login,
       *  name: doc.firstname + ' ' + doc.lastname,
       *  redmine: {
       *    login: doc.login,
       *    firstname: doc.firstname,
       *    lastname: doc.lastname
       *  }
       *});
       */

      console.log("user.lastname : ", user.lastname);
      console.log("user.firstname : ", user.firstname);

      Issue.find({ 'assigned_to.name': user.firstname + ' ' + user.lastname }, ['id'])
        .where('status.id').ne(5)
        .sort('priority.id', -1, 'project.name', 1)
        .run(function (err, issues) {
          //callback( err, issues );
          for (var i=0; i < issues.length; i++) {
            var issue = issues[i];
            user.issue_ids.push(issue.id);
          }
          //user.issues = issues;
          user.issuesCount = issues.length;
          //user.redmine.issues = issues;
          //user.redmine.issuesCount = issues.length;
          user.save(function () {
            eventsManager.emit('log', user);
          });
        });
    }
  });
};

redmine.getTeamMember = function( id, callback ) {
  User.findOne({id: id}, 'id name issuesCount issue_ids', function (err, user) {
    callback(err, user);
  });
};

redmine.getTeamMembers = function( callback ) {
  //User.find({}, 'id name issuesCount issue_ids current', function (err, usersArray) {
  User.where('mail')
  .$regex(server.config.redmine.mailFilter)
  .exec( function (err, usersArray) {
    callback(err, usersArray);
  });
};

redmine.getAllUsers = function( callback ) {
  User.find({}, function (err, usersArray) {
    var users = {};
    for (var i = usersArray.length - 1; i >= 0; i--) {
      users[usersArray[i].login] = usersArray[i];
    }
    callback(err, usersArray);
  });
};

redmine.getUserIssues = function( id, callback ) {
  User.findOne({id: id}, function (err, user) {
    if (user) {
      Issue.find({ 'assigned_to.name': user.redmine.firstname + ' ' + user.redmine.lastname })
      .sort('priority.id', -1, 'project.name', 1)
      .run(function (err, issuesArray) {
        var issues = {};
        for (var i = issuesArray.length - 1; i >= 0; i--) {
          issue = issuesArray[i];

          if (!!issue.description) {
            issue.description = textile(issue.description, {});
          }
        }
        callback(err, issuesArray);
      });
    }
  });
};

redmine.getIssues = function( ids, callback ) {
  ids = ids || false;
  var query = Issue.find({});
  if (ids) {
    query.where('id').in(ids);
  }
  query.select(['id', 'user', 'url', 'project', 'tracker', 'status', 'description', 'subject', 'priority', 'assigned_to']);
  query.where('status.id').ne(5);
  query.exec(function(err, issuesArray){
    for (var i = issuesArray.length - 1; i >= 0; i--) {
      issue = issuesArray[i];
      if (!!issue.description) {
        issue.description = textile(issue.description, {});
      }
    }
    callback(err, issuesArray);
  });
};

redmine.getIssue = function( id, callback ) {
  Issue.findOne({ id: id  }, function (err, issue) {
    callback(null, issue);
  });
};

var lastIssue = '';

redmine.syncIssues = function() {
  redmine.syncDatas();
  redmine.startAutoUpdate();
};

redmine.stopAutoUpdate = function stopAutoUpdate () {
  server.syncTimer.stop();
};

redmine.startAutoUpdate = function startAutoUpdate () {
  server.syncTimer = setInterval(redmine.syncDatas, 10 * 1000);
};

redmine.syncDatas = function () {
  redmine.checkLastIssue();
  redmine.checkTimeentries();
};

redmine.checkLastIssue = function(offset) {
  offset = offset || 0;
  redmineRest.getIssues({limit: '1', sort: 'updated_on:desc', offset: offset}, function(err, data) {
    if (data && data.issues) {
      var lastRedmineDate = new Date(data.issues[0].updated_on);
      var redmineIssue = data.issues[0];
      Issue.findOne({ 'id': redmineIssue.id }, function (err, issue) {
        if (issue) {
          var lastMongoDate = new Date(issue.updated_on);
          if (lastRedmineDate > lastMongoDate) {
            console.log("UPDATE NEEDED : ", redmineIssue.id);
            eventsManager.emit('log', redmineIssue);
            redmine.updateIssue(redmineIssue);
            redmine.checkLastIssue(++offset);
          }
          else {
            if (lastIssue !== redmineIssue.id) {
              console.log("issue up to date : ", redmineIssue.id);
            }
            lastIssue = redmineIssue.id;
          }
        }
        else {
          console.log("CREATE NEEDED : ", redmineIssue.id);
          redmine.createIssue(redmineIssue, function () {
            redmine.checkLastIssue(++offset);
          });
        }
      });
    }
  });
};

redmine.checkTimeentries = function () {
  TimeEntry.findOne().sort('id', -1).select('id').exec(function (err, lastTimeEntry) {
    if (!!lastTimeEntry) {
      redmineRest.getTimeEntry(lastTimeEntry.id + 1, function(err, data, context) {
        if (!!data) {
          var timeEntryData = data.time_entry;
          var timeEntry = new TimeEntry(timeEntryData);
          timeEntry.save();
          console.log('New TimeEntry : ', timeEntry.id);
          // console.log('timeEntryData.issue.id : ', timeEntryData.issue.id);

          Issue.findOne({id: timeEntryData.issue.id}, function (err, issue) {
            if (!issue) {
              // console.log('create issue needed', timeEntryData.issue.id);
              redmine.fetchIssue(timeEntryData.issue.id, function (fetchedIssue) {
                // Issue.findOne({id: timeEntryData.issue.id}, function (err, fetchedIssue) {
                  // console.log('findOne', timeEntryData.issue.id, fetchedIssue);
                  redmine.addTimeEntry(fetchedIssue, timeEntry);
                // });
              });
            }
            else {
              redmine.addTimeEntry(issue, timeEntry);
            }
          });
        }
      });
    }
  });
};

redmine.fetchIssue = function fetchIssue (id, callback) {
  // console.log('fetch issue', id);
  redmineRest.getIssue(id, function (err, issue) {
    // console.log('issue', issue);
    redmine.createIssue(issue, callback);
  });
};

redmine.addTimeEntry = function (issue, timeEntry) {
  issue.time_entries.push(timeEntry);

  // console.log('issue.time_entriesTotal', issue.time_entriesTotal);
  // console.log('timeEntry.hours', timeEntry.hours);

  if (timeEntry.hours) {
      issue.time_entriesTotal += timeEntry.hours;
  }
  issue.save();
  eventsManager.emit('buildIssueStats', issue.id, function () {
  });

  // console.log('Updated Issue ', issue.id);
  redmine.checkTimeentries();
};

redmine.createIssue = function(redmineIssue, callback) {
  console.log("creating issue : ", redmineIssue.id);
  var issue = new Issue(redmineIssue);
  issue.save();
  eventsManager.emit('createIssue', issue);
  callback(issue);
};

redmine.updateIssue = function(redmineIssue, callback) {
  var assignedTo = 'none';
  if (redmineIssue.hasOwnProperty('assigned_to')) {
    assignedTo = redmineIssue.assigned_to.name;
  }

  // console.log("updating issue : ", redmineIssue.id, assignedTo);
  Issue.remove({id: redmineIssue.id}, function() {
    var issue = new Issue(redmineIssue);
    console.log("updated issue : ", issue.id, issue.assigned_to.name);
    issue.save();
    eventsManager.emit('updateIssue', issue);
    eventsManager.emit('log', issue);
  });
};

redmine.testIssueUpdate = function testIssueUpdate (currentAssignation, callback) {



  var issue = {
    "created_on": "2012/04/28 10:30:04 +0200",
    "start_date": "2012/04/28",
    "description": "",
    "status": {
      "name": "Assigné",
      "id": 2
    },
    "done_ratio": 0,
    "project": {
      "name": "INT - skProject",
      "id": 296
    },
    "author": {
      "name": "Nicolas Clerc",
      "id": 156
    },
    "updated_on": "2012/11/18 17:38:36 +0100",
    "tracker": {
      "name": "Intervention",
      "id": 6
    },
    "id": 7922,
    "subject": ">>> demande de test pour maj temps réel <<<",
    "assigned_to": {
      "name": "Nicolas Clerc",
      "id": 156
    },
    "priority": {
      "name": "Immédiat",
      "id": 7
    }
  };

  if (issue.assigned_to.id === currentAssignation.id) {
    issue.assigned_to = {
      "name": "Sebastien Vitry",
      "id": 156
    };
  }

  redmine.updateIssue(issue);

};

redmine.getUserFromKey = function getUserFromKey ( key, callback ) {
  User.findOne( {apiKey: key}, function (err, user) {
    if (!user) {
      var redmineUserCheck = new Redmine({
        host: host,
        apiKey: key
      });

      redmineUserCheck.getUserFromKey( key, function(err, data) {
        callback(err, data);
      });
    }
    else {
      callback(err, false);
    }
  });
};

redmine.getUserFromUsername = function getUserFromUsername ( username, callback ) {
  User.findOne( {username: username}, function (err, user) {
    callback(err, user);
  });
};

redmine.createUser = function createUser ( userInfos, callback ) {
  userInfos.apiKey = userInfos.key;
  delete userInfos.key;
  User.findOne({ id: userInfos.id }, function (err, user) {
    if (!user) {
      var user = new User( userInfos );
    }
    else {
      user = userInfos;
    }
    user.save();
  });
  /*
   *User.update({ id: userInfos.id }, userInfos, { upsert: true }, function (err, numberAffected, raw) {
   *  //if (err) return handleError(err);
   *  console.log('The number of updated documents was %d', numberAffected);
   *  console.log('The raw response from Mongo was ', raw);
   *});
   */
  //var user = new User( userInfos );
  //user.save();
};

redmine.getUser = function getUser ( request, callback ) {
  User.findOne( request, function (err, user) {
    user.apiKey = user.getApiKey();
    callback(err, user);
  });
};

redmine.login = function login ( request, callback ) {
  User.findOne( {username: request.username}, function (err, user) {
    if (err) throw err;
    if (user) {
      user.comparePassword(request.password, function(err, isMatch) {
        if (err) throw err;
        callback(err, isMatch);
      });
    }
    else {
      callback(err, false);
    }
  });
};

redmine.connectUser = function connectUser ( username, callback ) {
  console.log('username', username);
  User.findOne( { username: username }, function (err, user) {
    server.users[username].redmineRest = new Redmine({
      host: host,
      apiKey: user.getApiKey()
    });
    server.users[username].redmineRest.request('GET', '/users/current.json', null, function(err, data) {
      callback( err, data );
    });
  });
};

redmine.disconnectUser = function disconnectUser ( username, callback ) {
  if (server.users[username]) {
    delete server.users[username].redmineRest;
  }
  callback(null, true);
};

redmine.updateCurrentIssue = function updateCurrentIssue ( currentIssue, callback ) {
  User.findOne({login: currentIssue.login}, function (err, user) {
    //callback(null, true);
    currentIssue.team_memberId = user.id;
    user.current = currentIssue;
    eventsManager.emit('redmine::currentIssueUpdated', currentIssue);
  });
};

module.exports = redmine;
