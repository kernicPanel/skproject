console.log("»»»»»redmineExtract load««««««");
var redmineExtract ={};
var Redmine = require('./redmine-rest.js');
//var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
//var textile = require('stextile');
var moment = require('moment');
var config = require('./config');

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

    eventsManager.on('redmineExtract::buildStats', function(callback){
        redmineExtract.buildStats(function(err, data) {
            callback(err, data);
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

var holiday = [];
for (var item in config.extract.holiday) {
    holiday = holiday.concat(config.extract.holiday[item]);
}

redmineExtract.buildStats = function(callback) {


    var setMoment = function(date) {
        if (date !== '') {
            return moment(date);
        }
        else {
            return date;
        }
    };

    var diffMoment = function(date, refDate) {
        //var momentDate = moment(date);
        if (date !== '') {
            //var diff =  momentDate.diff( refDate, 'hours', true);
            var diff =  date.diff( refDate, 'hours', true);
            //console.log("date : ", date);
            //console.log("diff : ", diff);
            //eventsManager.emit('log', {refDate: refDate, date: date, diff: diff});
            //var diff = date - refDate;
            var diffRound = Math.round(diff * 100) / 100;
            /*
             *console.groupCollapsed("diffRound : ", diffRound);
             *console.log("diff : ", diff);
             * //console.log("momentDate : ", momentDate);
             *console.log("date : ", date);
             *console.log("refDate : ", refDate);
             *console.groupEnd();
             */
            //return diffRound.toString().replace('.', ',');
            return diffRound;
        }
        else {
            return '';
        }
    };

    var workingDayDiff = function(date, refDate) {
        moment.lang('fr');
        if (date !== '') {
            var i = moment(refDate).hours(date.hours()).minutes(date.minutes()).seconds(date.seconds()).milliseconds(date.milliseconds());
            diff = 0;
            /*
             *console.log("===============");
             *console.log("===== next ====");
             *console.log("===============");
             */
            for (; i <= date; i.add('days', 1)) {
                //console.log("===== next day : ", i.format('D M YY dddd'));
                var timeDay = 0;
                if (refDate.format('D M YY') === date.format('D M YY')) {
                    //console.log("oneDay : ");

                    timeDay = date.diff( refDate, 'hours', true);

                    if (refDate.hours() <= 12 && date.hours() >= 14) {
                        timeDay -= 2;
                    }
                    diff += timeDay;
                }
                else if (i.format('D M YY') === refDate.format('D M YY')) {
                    //console.log("firstDay : ");

                    if (refDate.hours() < 18) {
                        var endDay = moment(refDate).hours(18).minutes(0).seconds(0).milliseconds(0);
                        timeDay += endDay.diff( refDate, 'hours', true);
                    }

                    if (refDate.hours() <= 12) {
                        timeDay -= 2;
                    }
                    diff += timeDay;
                }
                else if (i.format('D M YY') === date.format('D M YY')) {
                    //console.log("lastDay : ", i.format('D M YY'), date.format('D M YY'));
                    //console.log("lastDay : ");

                    if (date.hours() >= 9) {
                        var beginDay = moment(date).hours(9).minutes(0).seconds(0).milliseconds(0);
                        timeDay += date.diff( beginDay, 'hours', true);
                    }

                    if (date.hours() >= 14) {
                        timeDay -= 2;
                    }
                    //console.log("date.hours() : ", date.hours());
                    diff += timeDay;
                }
                else if (i.format('dddd') === 'samedi' || i.format('dddd') === 'dimanche' ||
                        holiday.indexOf(i.format('D M YY')) >= 0 ||
                        holiday.indexOf(i.format('D M')) >= 0
                         ) {
                    //console.log("holiday.indexOf(i.format('D M')) : ", holiday.indexOf(i.format('D M')));
                    //console.log("skip : ", i.format('D M YY dddd'));
                    //console.log("skip : ");
                    continue;
                }
                else{
                    //console.log("normal : ", i.format('D M YY dddd'));
                    timeDay += 7;
                    diff += timeDay;
                }
                //console.log("timeDay : ", timeDay);
                //console.log("diff : ", diff);
                //eventsManager.emit('log', {i: i.format('D M YY dddd'), timeDay: timeDay, diff: diff});
            }

            var diffRound = Math.round(diff * 100) / 100;
            return diffRound;
        }
        else {
            return '';
        }
    };

    //IssueExtract.buildStats(callback);
    var query = IssueExtract.find({});
    query.sort('project.name', 1);
    query.sort('created_on', 1);
    //query.only('id');
    //query.only('journals.id');

    //query.skip(26);
    //query.limit(2);

    //query.limit(1);

    //query.limit(20);

    var stream = query.stream();

    stream.on('data', function (issue) {
        console.log("issue watta watta : ", issue.id);
        /*
         *issue.getFirstJournal(function(err, data) {
         *    console.log("err : ", err);
         *    console.log("data : ", data);
         *});
         */
        var refMoment = moment(issue.created_on);

        issue.stats.dateFirstPost = null;
        issue.stats.delaiFirstPost = null;
        issue.stats.userFirstPost = null;
        issue.stats.dateAValider = null;
        issue.stats.delaiAValider = null;
        issue.stats.dateALivrer = null;
        issue.stats.delaiALivrer = null;
        issue.stats.dateLivre = null;
        issue.stats.delaiLivre = null;
        issue.stats.dateFerme = null;
        issue.stats.delaiFerme = null;
        issue.save();

        var journalsID = [];
        var loopCount = issue.journals.length;
        for (var i = 0; i < loopCount; i++) {
            var journal = issue.journals[i];
            journalsID.push(journal.id);
        }
        delete loopCount;
        Journal.firstPost(journalsID, function(err, journal) {
            if (journal) {
                //console.log("journal firstPost : ", journal);
                issue.stats.dateFirstPost = journal.created_on;

                var momentFirstPost = setMoment(journal.created_on);
                var delaiFirstPost = diffMoment(momentFirstPost, refMoment);
                var delaiFirstPostJourOuvre = workingDayDiff(momentFirstPost, refMoment);
                issue.stats.delaiFirstPost = delaiFirstPost;
                issue.stats.delaiFirstPostJourOuvre = delaiFirstPostJourOuvre;

                issue.stats.userFirstPost = journal.user.name;
                issue.save();
            }
        });
        Journal.firstAValider(journalsID, function(err, journal) {
            if (journal) {
                //console.log("journal firstAValider : ", journal);
                issue.stats.dateAValider = journal.created_on;

                var momentAValider = setMoment(journal.created_on);
                var delaiAValider = diffMoment(momentAValider, refMoment);
                var delaiAValiderJourOuvre = workingDayDiff(momentAValider, refMoment);
                issue.stats.delaiAValider = delaiAValider;
                issue.stats.delaiAValiderJourOuvre = delaiAValiderJourOuvre;

                issue.save();
            }
        });
        Journal.firstALivrer(journalsID, function(err, journal) {
            if (journal) {
                //console.log("journal firstALivrer : ", journal);
                issue.stats.dateALivrer = journal.created_on;

                var momentALivrer = setMoment(journal.created_on);
                var delaiALivrer = diffMoment(momentALivrer, refMoment);
                var delaiALivrerJourOuvre = workingDayDiff(momentALivrer, refMoment);
                issue.stats.delaiALivrer = delaiALivrer;
                issue.stats.delaiALivrerJourOuvre = delaiALivrerJourOuvre;

                issue.save();
            }
        });
        Journal.firstLivre(journalsID, function(err, journal) {
            if (journal) {
                //console.log("journal firstLivre : ", journal);
                issue.stats.dateLivre = journal.created_on;

                var momentLivre = setMoment(journal.created_on);
                var delaiLivre = diffMoment(momentLivre, refMoment);
                var delaiLivreJourOuvre = workingDayDiff(momentLivre, refMoment);
                issue.stats.delaiLivre = delaiLivre;
                issue.stats.delaiLivreJourOuvre = delaiLivreJourOuvre;

                issue.save();
            }
        });
        Journal.firstFerme(journalsID, function(err, journal) {
            if (journal) {
                //console.log("journal firstFerme : ", journal);
                issue.stats.dateFerme = journal.created_on;

                var momentFerme = setMoment(journal.created_on);
                var delaiFerme = diffMoment(momentFerme, refMoment);
                var delaiFermeJourOuvre = workingDayDiff(momentFerme, refMoment);
                issue.stats.delaiFerme = delaiFerme;
                issue.stats.delaiFermeJourOuvre = delaiFermeJourOuvre;

                issue.save();
            }
        });
        Journal.firstRejete(journalsID, function(err, journal) {
            if (journal) {
                //console.log("journal firstFerme : ", journal);
                issue.stats.dateRejete = journal.created_on;

                var momentRejete = setMoment(journal.created_on);
                var delaiRejete = diffMoment(momentRejete, refMoment);
                var delaiRejeteJourOuvre = workingDayDiff(momentRejete, refMoment);
                issue.stats.delaiRejete = delaiRejete;
                issue.stats.delaiRejeteJourOuvre = delaiRejeteJourOuvre;

                issue.save();
            }
        });
    });

    stream.on('error', function (err) {
        // handle err
    });

    stream.on('close', function () {
        // all done
        console.log("stream done !");
        callback();
    });
};

redmineExtract.getIssues = function(callback) {
    console.log("redmineExtract getIssues : ");
    var query = IssueExtract.find({});
    query.sort('project.name', 1);
    query.sort('created_on', 1);

    //query.skip(26);
    //query.limit(2);

    //query.limit(1);

    //query.limit(20);

    /*
     *query.exec( function (err, docs) {
     *    eventsManager.emit('log', docs);
     *    callback(err, docs);
     *});
     */

    var stream = query.stream();

    stream.on('data', function (doc) {
        console.log("doc watta watta : ", doc.id);
        eventsManager.emit('redmineExtract::getIssues::response', doc);
    });

    stream.on('error', function (err) {
        // handle err
    });

    stream.on('close', function () {
        // all done
        console.log("stream done !");
        eventsManager.emit('log', 'stats loaded');
        callback();
    });
};

redmineExtract.getProjects = function(callback) {
    console.log("redmineExtract getProjects : ");
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
    statsBuilded = false;

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
    else if (!statsBuilded) {
        redmineExtract.buildStats( callback );
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

                    journal.issueId = currentIssue.id;
                    console.log("journal.id : ", journal.id);
                    journal.save();
                    currentIssue.journals.push(journal);
                    currentIssue.save();

/*
 *                    var kLoopCount = journalData.details.length;
 *                    for (var k = 0; k < kLoopCount; k++) {
 *                        var detailData = journalData.details[k];
 *                        var detail = new Detail(detailData);
 *
 *                        detail.issueId = currentIssue.id;
 *                        console.log("detail.name : ", detail.name);
 *                        detail.created_on = journalData.created_on;
 *                        detail.save();
 *                    }
 *                    delete kLoopCount;
 */
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
                currentIssue.time_entriesTotal = 0;
                //console.log("data : ", data);
                var jLoopCount = data.time_entries.length;
                for (var j = 0; j < jLoopCount; j++) {
                    var timeEntryData = data.time_entries[j];
                    var timeEntry = new TimeEntry(timeEntryData);

                    console.log("timeEntry.id : ", timeEntry.id);
                    //console.log("timeEntry.hours : ", timeEntry.hours);
                    //console.log("timeEntry.hours + 1 : ", timeEntry.hours + 1);
                    //console.log("currentIssue.time_entriesTotal : ", currentIssue.time_entriesTotal);
                    timeEntry.save();
                    currentIssue.time_entries.push(timeEntry);
                    if (timeEntry.hours) {
                        currentIssue.time_entriesTotal += timeEntry.hours;
                    }
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
