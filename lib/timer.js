console.log("»»»»»timer load««««««");
var timer ={},
  mongoose = require('mongoose');
var eventsManager = server.eventsManager;


timer.init = function() {
  timer.events();
};

timer.events = function() {
  eventsManager.on('timer::start', function(userId, issueId, callback){
    timer.start(userId, issueId, function(err, data) {
      callback(err, data);
    });
  });

  eventsManager.on('timer::pause', function(callback){
    timer.pause( function(err, data) {
      callback(err, data);
    });
  });

  eventsManager.on('timer::stop', function(callback){
    timer.stop( function(err, data) {
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
  // console.log("storeCurrentIssue currentIssue : ", currentIssue);

  eventsManager.emit('log', currentIssue);

  var TeamMember = mongoose.model('TeamMember');

  if (!!currentIssue.login) {
    TeamMember.find({login:currentIssue.login}).update(currentIssue, callback);
    console.log("currentIssue : ", currentIssue);
    eventsManager.emit('timer::currentIssueUpdated', currentIssue);
  }
};

timer.start = function(userId, issueId, callback) {
  callback = callback || function(){};
  callback();
};

timer.pause = function(userId, callback) {
  callback = callback || function(){};
  callback();
};

timer.stop = function(userId, callback) {
  callback = callback || function(){};
  callback();
};

module.exports = timer;
