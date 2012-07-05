console.log("»»»»»redmineExtract load««««««");
var redmineExtract ={},
    Redmine = require('./redmine-rest.js'),
    //bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    textile = require('stextile');
    //config = require('./config');

//var eventsManager = require( './eventsManager.js' );
var eventsManager = server.eventsManager;

//var EventEmitter = require('events').EventEmitter;
//var eventsManager = new EventEmitter();

require('./models.js');
Schema = mongoose.Schema;

var User = mongoose.model('User');
var Issue = mongoose.model('Issue');
var Project = mongoose.model('Project');
var SkUser = mongoose.model('SkUser');
var SkProject = mongoose.model('SkProjects');
var SkIssue = mongoose.model('SkIssues');

var db = mongoose.connect(server.config.mongo.host);

var redmineRest = new Redmine({
    host: server.config.redmine.host,
    apiKey: server.config.redmine.apiKey
});

redmineExtract.init = function() {
    redmineExtract.events();
};

redmineExtract.events = function() {
    eventsManager.on('redmineExtract', function(callback){
        redmineExtract.getIssues(function(err, data) {
            callback(err, data);
        });
    });
};

redmineExtract.getIssues = function(callback) {
    console.log("redmineExtract getIssues : ");
    SkUser.find({}, function (err, docs) {
        console.log("err : ", err);
        console.log("docs : ", docs);
        //eventsManager.emit('getUsers::response', docs);
        callback(err, docs);
    });
};

module.exports = redmineExtract;
