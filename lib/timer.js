console.log("»»»»»timer load««««««");
var timer ={},
  mongoose = require('mongoose');
var eventsManager = server.eventsManager;

var TeamMember = mongoose.model('TeamMember');
var AppUser = mongoose.model('AppUser');

timer.init = function() {
  timer.events();
};

timer.events = function() {
  eventsManager.on('timer::start', function(username, issueId, callback){
    timer.start(username, issueId, function(err, data) {
      callback(err, data);
    });
  });

  eventsManager.on('timer::pause', function(username, callback){
    timer.pause(username, function(err, data) {
      callback(err, data);
    });
  });

  eventsManager.on('timer::stop', function(username, callback){
    timer.stop(username, function(err, data) {
      callback(err, data);
    });
  });

  eventsManager.on('timer::updateCurrentIssue', function(currentIssue, callback){
    // console.log("timer::currentIssue : ", currentIssue);
    storeCurrentIssue(currentIssue, function(err, data) {
      // callback(err, data);
    });
  });
};

var storeCurrentIssue = function(currentIssue, callback) {
  if (!!currentIssue.login) {
    TeamMember.find({login:currentIssue.login}).update(currentIssue, callback);
    // console.log("currentIssue : ", currentIssue);
    eventsManager.emit('log', currentIssue);
    eventsManager.emit('timer::currentIssueUpdated', currentIssue);
  }
};

timer.getUserFromId = function getUserFromId ( id, callback ) {
  AppUser.findOne( {id: id}, function (err, appUser) {
    callback(err, appUser);
  });
};

timer.getUserFromUsername = function getUserFromUsername ( username, callback ) {
  console.log(" username : ", username);
  AppUser.findOne( {username: username}, function (err, appUser) {
    callback(err, appUser);
  });
};

timer.start = function(username, issueId, callback) {
  console.log("timer start username : ", username);
  timer.getUserFromUsername( username, function( err, appUser ){
    appUser.startIssue( issueId, function( err, duration ) {
      callback( err, duration );
    });
  });
};

timer.pause = function(username, callback) {
  timer.getUserFromUsername( username, function( err, appUser ){
    eventsManager.emit('log', appUser);
    appUser.pauseIssue( function( err, duration ) {
      callback( err, duration );
    });
  });
};

timer.stop = function(username, callback) {
  console.log("redmine stop username : ", username);
  timer.getUserFromUsername( username, function( err, appUser ){
    appUser.stopIssue( function( err, currentIssue ) {
      //callback( err, currentIssue );
      var params = {
        time_entry:{
          issue_id: currentIssue.id,
          hours: currentIssue.pendingDuration / 1000 / 60
        }
      };
      var userRest = server.users[username].redmineRest;
      console.log("username : ", username);
      console.log("params : ", params);

      eventsManager.emit('log', username);
      eventsManager.emit('log', params);
      /*
       *userRest.request('POST', '/time_entries.json', params, function(err, data) {
       *  console.log("data response : ", data);
       *  callback( err, data );
       *});
    */
    });
  });
};

module.exports = timer;
