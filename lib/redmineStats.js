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

console.log("»»»»»redmineStats load««««««".verbose);
var redmineStats ={};
var Redmine = require('./redmine-rest.js');
var mongoose = require('mongoose');
var moment = require('moment');
var config = require('./config');

var eventsManager = server.eventsManager;


var mongoHost = server.config.mongo.host;
if (!!process.env.VCAP_SERVICES) {
    var mongoSetup = JSON.parse(process.env.VCAP_SERVICES);
    mongoHost = mongoSetup["mongodb-1.8"][0].credentials.url;
}

require('./models.js');
Schema = mongoose.Schema;

var Journal = mongoose.model('Journal');
var TimeEntry = mongoose.model('TimeEntry');
var Issue = mongoose.model('Issue');
var Project = mongoose.model('Project');

var db = mongoose.connect(mongoHost);

var redmineRest = new Redmine({
    host: server.config.redmine.host,
    apiKey: server.config.redmine.apiKey
});

var projectsStored = false;
var issuesStored = false;
var timeEntriesStored = false;
var notesStored = false;

redmineStats.init = function() {
    redmineStats.events();
};

redmineStats.events = function() {
    eventsManager.on('redmineStats::sync', function(data){
        redmineStats.sync( function(err, data) {
        });
    });

    eventsManager.on('redmineStats::buildStats', function(id, callback){
        redmineStats.buildStats(id, function(err, data) {
            callback(err, data);
        });
    });

    eventsManager.on('redmineStats::getStats', function(settings, callback){
        redmineStats.getStats(settings, function(err, stats) {
            callback(err, stats);
        });
    });

    eventsManager.on('redmineStats::getIssuesStats', function(settings, callback){
        redmineStats.getIssuesStats(settings, function(err, stats) {
            callback(err, stats);
        });
    });

    eventsManager.on('redmineStats::getIssues', function(callback){
        redmineStats.getIssues(function(err, data) {
            callback(err, data);
        });
    });

    eventsManager.on('redmineStats::getGarantie', function(callback){
        redmineStats.getGarantie(function(err, data) {
            callback(err, data);
        });
    });

    eventsManager.on('redmineStats::getSupport', function(callback){
        redmineStats.getSupport(function(err, data) {
            callback(err, data);
        });
    });

    eventsManager.on('redmineStats::getProjects', function(callback){
        redmineStats.getProjects(function(err, data) {
            callback(err, data);
        });
    });

    eventsManager.on('redmineStats::setProject', function(id, callback){
        redmineStats.setProject(id, function(err, project) {
            callback(err, project);
        });
    });

    eventsManager.on('redmineStats::taskDone', function(callback){
        console.log("taskDone!!");
        redmineStats.workflow(function(err, data) {
            callback(err, data);
        });
    });

    eventsManager.on('redmineStats::storeAllProjectsDone', function(callback){
        console.log("storeAllProjectsDone!!");
        projectsStored = true;
    });

    eventsManager.on('redmineStats::storeAllIssuesDone', function(callback){
        console.log("storeAllIssuesDone!!");
        issuesStored = true;
    });

    eventsManager.on('redmineStats::storeAllNotesDone', function(callback){
        console.log("storeAllNotesDone!!");
        notesStored = true;
    });

    eventsManager.on('redmineStats::storeAllTimeEntriesDone', function(callback){
        console.log("storeAllTimeEntriesDone!!");
        timeEntriesStored = true;
    });

    eventsManager.on('redmineStats::buildStatsDone', function(callback){
        console.log("buildStatsDone!!");
        statsBuilded = true;
    });
};

var holiday = [];
for (var item in config.extract.holiday) {
    holiday = holiday.concat(config.extract.holiday[item]);
}

redmineStats.buildStats = function(id, callback) {
    id = id || '';
    console.log('buildStats', id);

    var setMoment = function(date) {
        if (date !== '') {
            return moment(date);
        }
        else {
            return date;
        }
    };

    var diffMoment = function(date, refDate) {
        if (date !== '') {
            var diff =  date.diff( refDate, 'hours', true);
            var diffRound = Math.round(diff * 100) / 100;
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
            for (; i <= date; i.add('days', 1)) {
                var timeDay = 0;
                if (refDate.format('D M YY') === date.format('D M YY')) {

                    timeDay = date.diff( refDate, 'hours', true);

                    if (refDate.hours() <= 12 && date.hours() >= 14) {
                        timeDay -= 2;
                    }
                    diff += timeDay;
                }
                else if (i.format('D M YY') === refDate.format('D M YY')) {

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

                    if (date.hours() >= 9) {
                        var beginDay = moment(date).hours(9).minutes(0).seconds(0).milliseconds(0);
                        timeDay += date.diff( beginDay, 'hours', true);
                    }

                    if (date.hours() >= 14) {
                        timeDay -= 2;
                    }
                    diff += timeDay;
                }
                else if (i.format('dddd') === 'samedi' || i.format('dddd') === 'dimanche' ||
                        holiday.indexOf(i.format('D M YY')) >= 0 ||
                        holiday.indexOf(i.format('D M')) >= 0
                         ) {
                    continue;
                }
                else{
                    timeDay += 7;
                    diff += timeDay;
                }
            }

            var diffRound = Math.round(diff * 100) / 100;
            return diffRound;
        }
        else {
            return '';
        }
    };

    var query = Issue.find({});
    var count = Issue.count({});
    var total = 0;
    var counter = 0;

    if (id !== '') {
        query.where('id').equals(id);
        count.where('id').equals(id);
    }
    // query.sort('project.name', 1);
    // query.sort('created_on', 1);
    //query.only('id');
    //query.only('journals.id');

    //query.skip(26);
    //query.limit(2);

    //query.limit(1);

    // query.limit(20);

    count.exec(function (err, count) {
        total = count;
    });

    var stream = query.stream();

    stream.on('data', function (issue) {
        // console.log("build issue stats : ", issue.id);
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
                issue.stats.dateRejete = journal.created_on;

                var momentRejete = setMoment(journal.created_on);
                var delaiRejete = diffMoment(momentRejete, refMoment);
                var delaiRejeteJourOuvre = workingDayDiff(momentRejete, refMoment);
                issue.stats.delaiRejete = delaiRejete;
                issue.stats.delaiRejeteJourOuvre = delaiRejeteJourOuvre;

                issue.save();
            }
        });

        eventsManager.emit('syncPending', {
            type: 'build stats',
            text: Math.round(++counter / total * 100)
        });
    });

    stream.on('error', function (err) {
        console.log('error', err);
    });

    stream.on('close', function () {
        console.log("stream done !");
        eventsManager.emit('syncDone', {type: 'build stats', text: 'stats builded'});

        eventsManager.emit('redmineStats::buildStatsDone');
        if (id === '') {
            eventsManager.emit('redmineStats::taskDone', callback);
        }
        callback('Stats builded');
    });
};

redmineStats.getStats = function(settings, callback) {
    var team = config.extract.team;
    var projectId = parseInt(settings.project, 10);
    var from = settings.from;
    var to = settings.to;
    var teamPost = settings.teamPost;
    console.log("redmineStats getStats : ", settings);
    eventsManager.emit('log', settings);
    var parent = {};

    if (projectId !== 'All') {
        projectFilter = {'parent.id':projectId};
    }

    Project.find(projectFilter, ['id'], function (err, data) {
        var projectsIds = [];
        for (var i = data.length - 1; i >= 0; i--) {
            projectsIds.push(data[i].id);
        }

        var query = Issue.find({});
        query.sort('project.name', 1);
        query.sort('created_on', 1);
        if (projectId !== 'All') {
            projectsIds.push(projectId);
            query.where('project.id').in(projectsIds);
        }
        if (!teamPost) {
            query.where('author.name').nin(team);
        }
        query.where('created_on').gte(from).lte(to);
        //query.where('created_on').gte(new Date("December 1, 2011"));

        //query.skip(26);
        //query.limit(2);

        //query.limit(1);

        // query.limit(40);

        var stream = query.stream();

        stream.on('data', function (doc) {
            console.log("getStats doc : ", doc.id);
            eventsManager.emit('redmineStats::getStats::response', doc);
        });

        stream.on('error', function (err) {});

        stream.on('close', function () {
            console.log("getStats done !");
            eventsManager.emit('redmineStats::getStats::done');
            callback();
        });
    });
};

redmineStats.getIssuesStats = function(settings, callback) {
    var team = config.extract.team;
    var projectId = parseInt(settings.project, 10);
    var from = settings.from;
    var to = settings.to;
    var teamPost = settings.teamPost;
    var closed = settings.closed;
    var assignedToTeam = settings.assignedToTeam;
    console.log("redmineStats getIssuesStats : ", settings);
    eventsManager.emit('log', settings);
    var parent = {};

    if (projectId !== 'All') {
        projectFilter = {'parent.id':projectId};
    }

    Project.find(projectFilter, ['id'], function (err, data) {
        var projectsIds = [];
        for (var i = data.length - 1; i >= 0; i--) {
            projectsIds.push(data[i].id);
        }

        var query = Issue.find({});
        query.select('id url estimated_hours time_entriesTotal done_ratio priority assigned_to status');
        query.sort('project.name', 1);
        // query.sort('created_on', 1);
        query.sort('assigned_to.name', 1);
        if (projectId !== 'All') {
            projectsIds.push(projectId);
            query.where('project.id').in(projectsIds);
        }
        // query.where('assigned_to.name', 'Frédéric Eveno');
        if (!teamPost) {
            query.where('author.name').nin(team);
        }
        if (!closed) {
            query.where('status.name').nin(["Fermé"]);
        }
        if (assignedToTeam) {
            query.where('assigned_to.name').in(team);
        }
        query.where('created_on').gte(from).lte(to);
        //query.where('created_on').gte(new Date("December 1, 2011"));

        //query.skip(26);
        //query.limit(2);

        //query.limit(1);

        // query.limit(40);

        query.exec(function (err, issues) {
            callback(err, issues);
        });

        // var stream = query.stream();

        // stream.on('data', function (doc) {
        //     console.log("getStats doc : ", doc.id);
        //     eventsManager.emit('redmineStats::getStats::response', doc);
        // });

        // stream.on('error', function (err) {});

        // stream.on('close', function () {
        //     console.log("getStats done !");
        //     eventsManager.emit('redmineStats::getStats::done');
        //     callback();
        // });
    });
};

redmineStats.getIssues = function(callback) {
    var team = config.extract.team;
    console.log("redmineStats getIssues : ");
    var query = Issue.find({});
    query.sort('project.name', 1);
    query.sort('created_on', 1);
    query.where('author.name').nin(team);
    query.where('created_on').gte(new Date("December 15, 2010")).lte(new Date("November 30, 2011"));
    //query.where('created_on').gte(new Date("December 1, 2011"));

    //query.skip(26);
    //query.limit(2);

    //query.limit(1);

    query.limit(40);

    var stream = query.stream();

    stream.on('data', function (doc) {
        console.log("getIssues doc : ", doc.id);
        eventsManager.emit('redmineStats::getIssues::response', doc);
    });

    stream.on('error', function (err) {});

    stream.on('close', function () {
        console.log("getIssues done !");
        eventsManager.emit('log', 'getIssues stats loaded');
        eventsManager.emit('redmineStats::getIssues::done');
        callback();
    });
};

redmineStats.getSupport = function(callback) {
    var team = config.extract.team;
    console.log("redmineStats getIssues : ");
    var query = Issue.find({});
    query.sort('project.name', 1);
    query.sort('created_on', 1);
    query.where('author.name').nin(team);
    query.where('created_on').gte(new Date("December 1, 2011"));
    var stream = query.stream();

    stream.on('data', function (doc) {
        console.log("getSupport doc : ", doc.id);
        eventsManager.emit('redmineStats::getIssues::response', doc);
    });

    stream.on('error', function (err) {});

    stream.on('close', function () {
        console.log("getSupport done !");
        eventsManager.emit('log', 'getSupport stats loaded');
        callback();
    });
};

redmineStats.getGarantie = function(callback) {
    var team = config.extract.team;
    console.log("redmineStats getIssues : ");
    var query = Issue.find({});
    query.sort('project.name', 1);
    query.sort('created_on', 1);
    query.where('author.name').nin(team);
    query.where('created_on').gte(new Date("December 15, 2010")).lte(new Date("November 30, 2011"));

    var stream = query.stream();

    stream.on('data', function (doc) {
        console.log("getGarantie doc : ", doc.id);
        eventsManager.emit('redmineStats::getIssues::response', doc);
    });

    stream.on('error', function (err) {});

    stream.on('close', function () {
        console.log("getGarantie done !");
        eventsManager.emit('log', 'getGarantie stats loaded');
        callback();
    });
};

redmineStats.getProjects = function(callback) {
    console.log("redmineStats getProjects : ");
    Project.find({parent:null}, ['id', 'name'], function (err, projects) {
    // Project.find({parent:null}, function (err, projects) {
        callback(err, projects);
        return projects;
    });
};

redmineStats.setProject = function(id, callback) {
    console.log("redmineStats setProject : ", id);
    // Project.find({}, ['id', 'name'], function (err, projects) {
    Project.findOne({id: id}, function (err, project) {
        callback(err, project);
        return project;
    });
};

redmineStats.sync = function( callback ) {
    console.log("===> redmine.js : sync");

    eventsManager.emit('rebuild::on');

    projectsStored = false;
    issuesStored = false;
    timeEntriesStored = false;
    notesStored = false;
    statsBuilded = false;

    redmineStats.workflow(callback);
};

redmineStats.workflow = function( callback ) {
    console.log("===> redmine.js : workflow");

    if (!projectsStored) {
        redmineStats.storeAllProjects( callback );
    }
    else if (!issuesStored) {
        redmineStats.storeAllIssues( callback );
    }
    // else if (!notesStored) {
    //     redmineStats.storeAllNotes( callback );
    // }
    // else if (!timeEntriesStored) {
    //     redmineStats.storeAllTimeEntries( callback );
    // }
    // else if (!statsBuilded) {
    //     redmineStats.buildStats( '', callback );
    // }
    else {
        console.log("——————workflow done——————");
        eventsManager.emit('rebuild::off');
    }
};

redmineStats.storeAllProjects = function( callback ) {
    console.log("===> redmineStats.js : storeAllProjects");

    Project.collection.drop();

    var itemsCount;
    var lastItem = 0;
    var itemsList = [];

    var storeAllItems = function() {
        // console.log("lastItem : ", lastItem);
        // console.log("itemsCount : ", itemsCount);
        if (lastItem === itemsCount) {
            callback( null, itemsList );
            eventsManager.emit('redmineStats::storeAllProjectsDone');
            eventsManager.emit('redmineStats::taskDone', callback);
            return;
        }

        redmineRest.getItems('projects', {limit: 100, offset: lastItem}, function(err, data) {
            if (err) {
                console.log("error : ", err.message);
                return;
            }
            itemsCount = data.total_count;

            var items = data['projects'];
            var loopCount = items.length;
            for (var i = 0; i < loopCount; i++) {
                lastItem++;
                itemsList.push( items[i] );

                var item = new Project( items[i] );
                item.redmine_id = items[i]['id'];
                item.type_id = 'issues' + '_' + items[i]['id'];
                //console.log("item : ", item);
                eventsManager.emit('syncPending', {
                  type: 'projects',
                  text: Math.round(itemsList.length / (itemsCount) * 100)
                });
                item.save();

                if (itemsList.length === itemsCount) {
                  eventsManager.emit('syncDone', {type: 'projects', text: 'updated'});
                }
            }
            storeAllItems();
        });
    };
    storeAllItems();
    return;
};
redmineStats.storeAllIssues = function( callback ) {
    console.log("===> redmineStats.js : storeAllIssues");

    Issue.collection.drop();

    var itemsCount;
    var lastItem = 0;
    var itemsList = [];

    var storeAllItems = function() {
        // console.log("lastItem : ", lastItem);
        // console.log("itemsCount : ", itemsCount);
        if (lastItem === itemsCount) {
            callback( null, itemsList );
            eventsManager.emit('redmineStats::storeAllIssuesDone');
            eventsManager.emit('redmineStats::taskDone', callback);
            return;
        }

        redmineRest.getItems('issues', {status_id: '*', include:'journals', limit: 100, offset: lastItem}, function(err, data) {
            if (err) {
                console.log("error : ", err.message);
                return;
            }
            itemsCount = data.total_count;

            var items = data.issues;
            var loopCount = items.length;
            for (var i = 0; i < loopCount; i++) {
                lastItem++;
                itemsList.push( items[i] );

                if (!!items[i].description) {
                    items[i].description = items[i].description.replace(/<script/g, '<fuckingScript');
                    items[i].description = items[i].description.replace(/script>/g, 'fuckingScript>');
                    items[i].description = items[i].description.replace(/<iframe/g, '<fuckingIframe');
                    items[i].description = items[i].description.replace(/iframe>/g, 'fuckingIframe>');
                    items[i].description = items[i].description.replace(/<img/g, '<fuckingImg');
                }
                // if (items[i].id === (8144 || 7922)) {
                if (items[i].id === 7922) {
                    eventsManager.emit('log', items[i].description);
                }

                var item = new Issue( items[i] );
                // item.redmine_id = items[i]['id'];
                // item.type_id = 'issues' + '_' + items[i]['id'];
                //console.log("item : ", item);
                eventsManager.emit('syncPending', {
                  type: 'issues',
                  text: Math.round(itemsList.length / (itemsCount) * 100),
                  message: 'truc'
                });
                item.save();

                if (itemsList.length === itemsCount) {
                  eventsManager.emit('syncDone', {type: 'issue', text: 'updated'});
                }
            }
            storeAllItems();
        });
    };
    storeAllItems();
    return;
};

redmineStats.storeAllNotes = function( callback ) {
    console.log("===> redmineStats.js : storeAllNotes");

    Journal.collection.drop();

    Issue.find({}, function (err, docs) {
        var iLoopCount = docs.length;
        for (var i = 0; i < iLoopCount; i++) {
            var issue = docs[i];

            // console.log("storeAllNotes currentIssue.id : ", i, '/', iLoopCount, ' ', issue.id);


            var context = {
                issue: issue,
                current:i,
                total:iLoopCount
            };

            var current = 0;
            var counter = 0;

            redmineRest.getIssueParamsAddData(issue.id, {include: 'journals'}, function(err, data, context) {

                // eventsManager.emit('log', context);
                // console.log('err', err);
                // console.log('data', data);
                // console.log('context', context);

                var currentIssue = context.issue;
                current = Math.max(current, context.current);
                var total = context.total;

                eventsManager.emit('syncPending', {
                  type: 'issue journals',
                  text: Math.round(++counter / total * 100)
                });

                if (current === total) {
                  eventsManager.emit('syncDone', {type: 'issue journals', text: 'timeEntries updated'});
                }

                var jLoopCount = data.issue.journals.length;
                for (var j = 0; j < jLoopCount; j++) {
                    var journalData = data.issue.journals[j];
                    var journal = new Journal(journalData);

                    journal.issueId = currentIssue.id;
                    // console.log("storeAllNotes journal.id : ", j, '/', jLoopCount, ' ', journal.id);
                    journal.save();
                    currentIssue.journals.push(journal);
                    eventsManager.emit('syncPending', {
                      type: 'journals',
                      text: Math.round((j + 1) / jLoopCount * 100)
                    });
                    currentIssue.save();

                }
                delete jLoopCount;
                if (currentIssue == issue) {
                    eventsManager.emit('redmineStats::storeAllNotesDone');
                    eventsManager.emit('redmineStats::taskDone', callback);
                }
                callback(err, data);
            }, context);
        }
        delete iLoopCount;
    });
};

redmineStats.storeAllTimeEntries = function( callback ) {
    console.log("===> redmineStats.js : storeAllTimeEntries");

    TimeEntry.collection.drop();

    Issue.find({}, function (err, docs) {
        var iLoopCount = docs.length;
        for (var i = 0; i < iLoopCount; i++) {
            var issue = docs[i];
            // console.log("storeAllTimeEntries currentIssue.id : ", i, '/', iLoopCount, ' ', issue.id);

            var context = {
                issue: issue,
                current:i,
                total:iLoopCount
            };

            var current = 0;
            var counter = 0;

            redmineRest.getTimeEntriesParamsAddData({issue_id: issue.id.toString()}, function(err, data, context) {

                var currentIssue = context.issue;
                current = Math.max(current, context.current);
                var total = context.total;

                eventsManager.emit('syncPending', {
                  type: 'issue timeEntries',
                  text: Math.round(++counter / total * 100)
                });

                if (current === total) {
                  eventsManager.emit('syncDone', {type: 'issue timeEntries', text: 'timeEntries updated'});
                }


                // eventsManager.emit('log', context);
                // console.log("currentIssue.id : ", currentIssue.id);
                currentIssue.time_entriesTotal = 0;
                var jLoopCount = data.time_entries.length;
                for (var j = 0; j < jLoopCount; j++) {
                    var timeEntryData = data.time_entries[j];
                    var timeEntry = new TimeEntry(timeEntryData);

                    // console.log("timeEntry.id : ", timeEntry.id);
                    // console.log("storeAllTimeEntries timeEntry.id : ", j, '/', jLoopCount, ' ', timeEntry.id);

                    timeEntry.save();
                    currentIssue.time_entries.push(timeEntry);
                    if (timeEntry.hours) {
                        currentIssue.time_entriesTotal += timeEntry.hours;
                    }
                    eventsManager.emit('syncPending', {
                      type: 'timeEntries',
                      text: Math.round((j + 1) / jLoopCount * 100)
                    });
                    currentIssue.save();

                }
                delete jLoopCount;
                if (currentIssue == issue) {
                    eventsManager.emit('redmineStats::storeAllTimeEntriesDone');
                    eventsManager.emit('redmineStats::taskDone', callback);
                }
                callback(err, data);
            }, context);
        }
        delete iLoopCount;
    });
};

module.exports = redmineStats;
