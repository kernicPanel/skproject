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
var Detail = mongoose.model('Detail');
var Journal = mongoose.model('Journal');
var TimeEntry = mongoose.model('TimeEntry');
var IssueExtract = mongoose.model('IssueExtract');
var Project = mongoose.model('Project');
var SkUser = mongoose.model('SkUser');
var SkProject = mongoose.model('SkProjects');
var SkIssue = mongoose.model('SkIssues');

var db = mongoose.connect(server.config.mongo.host);

var redmineRest = new Redmine({
    host: server.config.redmine.host,
    apiKey: server.config.redmine.apiKey
});

var issuesStored = false;
var timeEntriesStored = false;
var notesStored = false;

redmineExtract.init = function() {
    redmineExtract.events();
};

redmineExtract.events = function() {
    eventsManager.on('redmineExtract::sync', function(data){
        redmineExtract.sync( function(err, data) {
        });
    });

    eventsManager.on('redmineExtract::getIssues', function(callback){
        redmineExtract.getIssues(function(err, data) {
            callback(err, data);
        });
    });

    eventsManager.on('redmineExtract::getProjects', function(callback){
        redmineExtract.getProjects(function(err, data) {
            callback(err, data);
        });
    });

    eventsManager.on('redmineExtract::taskDone', function(callback){
        console.log("taskDone!!");
        redmineExtract.workflow(function(err, data) {
            callback(err, data);
        });
    });

    eventsManager.on('redmineExtract::storeAllIssuesDone', function(callback){
        console.log("storeAllIssuesDone!!");
        issuesStored = true;
    });

    eventsManager.on('redmineExtract::storeAllNotesDone', function(callback){
        console.log("storeAllNotesDone!!");
        notesStored = true;
    });

    eventsManager.on('redmineExtract::storeAllTimeEntriesDone', function(callback){
        console.log("storeAllTimeEntriesDone!!");
        timeEntriesStored = true;
    });
};

redmineExtract.getIssues = function(callback) {
    console.log("redmineExtract getIssues : ");
    var query = IssueExtract.find({});
    //query.where('project.name').in(['ANCA - Aéroport de nice - V1']);
    query.where('project.name').in(server.config.extract.subprojects);
    query.exec(callback);
    /*
     *Issue.find({'project.name': 'ANCA*'}, function (err, docs) {
     *    //console.log("err : ", err);
     *    //console.log("docs : ", docs);
     *    //eventsManager.emit('getUsers::response', docs);
     *    callback(err, docs);
     *});
     */
};

redmineExtract.getProjects = function(callback) {
    console.log("redmineExtract getIssues : ");
    Project.find({"parent.name": server.config.extract.projectName}, ['name'], function (err, docs) {
        //console.log("err : ", err);
        //console.log("docs : ", docs);
        //eventsManager.emit('getUsers::response', docs);
        callback(err, docs);
        return docs;
    });
};

redmineExtract.sync = function( callback ) {
    console.log("===> redmine.js : sync");

    issuesStored = false;
    timeEntriesStored = false;
    notesStored = false;

    redmineExtract.workflow(callback);
};

redmineExtract.workflow = function( callback ) {
    console.log("===> redmine.js : workflow");

    if (!issuesStored) {
        redmineExtract.storeAllIssues( callback );
    }
    else if (!notesStored) {
        redmineExtract.storeAllNotes( callback );
    }
    else if (!timeEntriesStored) {
        redmineExtract.storeAllTimeEntries( callback );
    }
    else {
        console.log("——————workflow done——————");
    }
};


/*
 *redmineExtract.storeAll = function( itemModel, type, callback) {
 *    console.log("===> redmineExtract.js : getAllProjects");
 *
 *    //var itemModel = db.model(type, itemSchema);
 *    itemModel.collection.drop();
 *
 *    var itemsCount;
 *    var lastItem = 0;
 *    var itemsList = [];
 *
 *    var storeAllItems = function() {
 *        console.log("lastItem : ", lastItem);
 *        console.log("itemsCount : ", itemsCount);
 *        if (lastItem === itemsCount) {
 *            callback( null, itemsList );
 *            //mongoose.connection.close();
 *            return;
 *        }
 *
 *        redmineRest.getItems(type, {project_id: server.config.extract.projectIdentifier, status_id: '*', limit: 100, offset: lastItem}, function(err, data) {
 *            if (err) {
 *                console.log("error : ", err.message);
 *                return;
 *            }
 *            itemsCount = data.total_count;
 *
 *            var items = data[type];
 *            //console.log("items : ", items);
 *            var loopCount = items.length;
 *            for (var i = 0; i < loopCount; i++) {
 *                lastItem++;
 *                itemsList.push( items[i] );
 *                //console.log("items[i]['id'] : ", items[i]['id']);
 *
 *                var item = new itemModel( items[i] );
 *                item.redmine_id = items[i]['id'];
 *                item.type_id = type + '_' + items[i]['id'];
 *                console.log("item : ", item);
 *                //item.redmine_id = 'rstrstnrstnrstnrstnrstnrst';
 *                //item.commit('any');
 *                item.save();
 *            }
 *            //socket.emit('log', type + ':' + lastItem + '/' + itemsCount);
 *            storeAllItems();
 *        });
 *    };
 *    storeAllItems();
 *    return;
 *};
 */

redmineExtract.storeAllIssues = function( callback ) {
    //redmineExtract.storeAll(IssueExtract, 'issues', callback);
    console.log("===> redmineExtract.js : storeAllIssues");

    IssueExtract.collection.drop();

    var itemsCount;
    var lastItem = 0;
    var itemsList = [];

    var storeAllItems = function() {
        console.log("lastItem : ", lastItem);
        console.log("itemsCount : ", itemsCount);
        if (lastItem === itemsCount) {
            callback( null, itemsList );
            eventsManager.emit('redmineExtract::storeAllIssuesDone');
            eventsManager.emit('redmineExtract::taskDone', callback);
            return;
        }

        redmineRest.getItems('issues', {project_id: server.config.extract.projectIdentifier, status_id: '*', include:'journals', limit: 100, offset: lastItem}, function(err, data) {
            if (err) {
                console.log("error : ", err.message);
                return;
            }
            itemsCount = data.total_count;

            var items = data['issues'];
            //console.log("items : ", items);
            var loopCount = items.length;
            for (var i = 0; i < loopCount; i++) {
                lastItem++;
                itemsList.push( items[i] );
                //console.log("items[i]['id'] : ", items[i]['id']);
                //console.log("items[i] : ", items[i]);
                //console.log("items[i]['journals'] : ", items[i]['journals']);

                var item = new IssueExtract( items[i] );
                item.redmine_id = items[i]['id'];
                item.type_id = 'issues' + '_' + items[i]['id'];
                //console.log("item : ", item);
                item.save();
            }
            storeAllItems();
        });
    };
    storeAllItems();
    return;
};

redmineExtract.storeAllNotes = function( callback ) {
    console.log("===> redmineExtract.js : storeAllNotes");

    Journal.collection.drop();

    IssueExtract.find({}, function (err, docs) {
        var iLoopCount = docs.length;
        //iLoopCount = 1;
        for (var i = 0; i < iLoopCount; i++) {
            var issue = docs[i];
            redmineRest.getIssueParamsAddData(issue.id, {include: 'journals'}, function(err, data, currentIssue) {

                console.log("currentIssue.id : ", currentIssue.id);
                var jLoopCount = data.issue.journals.length;
                for (var j = 0; j < jLoopCount; j++) {
                    var journalData = data.issue.journals[j];
                    var journal = new Journal(journalData);

                    console.log("journal.id : ", journal.id);
                    journal.save();
                    currentIssue.journals.push(journal);
                    currentIssue.save();

                }
                delete jLoopCount;
                if (currentIssue == issue) {
                    eventsManager.emit('redmineExtract::storeAllNotesDone');
                    eventsManager.emit('redmineExtract::taskDone', callback);
                }
                callback(err, data);
            }, issue);
        }
        delete iLoopCount;
    });
};

redmineExtract.storeAllTimeEntries = function( callback ) {
    console.log("===> redmineExtract.js : storeAllTimeEntries");

    TimeEntry.collection.drop();

    IssueExtract.find({}, function (err, docs) {
        var iLoopCount = docs.length;
        //iLoopCount = 2;
        for (var i = 0; i < iLoopCount; i++) {
            var issue = docs[i];
            console.log("issue.id : ", issue.id);
            redmineRest.getTimeEntriesParamsAddData({issue_id: issue.id.toString()}, function(err, data, currentIssue) {

                console.log("currentIssue.id : ", currentIssue.id);
                //console.log("data : ", data);
                var jLoopCount = data.time_entries.length;
                for (var j = 0; j < jLoopCount; j++) {
                    var timeEntryData = data.time_entries[j];
                    var timeEntry = new TimeEntry(timeEntryData);

                    console.log("timeEntry.id : ", timeEntry.id);
                    timeEntry.save();
                    currentIssue.time_entries.push(timeEntry);
                    currentIssue.save();

                }
                delete jLoopCount;
                if (currentIssue == issue) {
                    eventsManager.emit('redmineExtract::storeAllTimeEntriesDone');
                    eventsManager.emit('redmineExtract::taskDone', callback);
                }
                callback(err, data);
            }, issue);
        }
        delete iLoopCount;
    });
};

module.exports = redmineExtract;
