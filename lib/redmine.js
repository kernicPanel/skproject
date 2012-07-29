console.log("»»»»»redmine load««««««");
var redmine ={},
    Redmine = require('./redmine-rest.js'),
    //bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    textile = require('stextile');
    //config = require('./config');

if (typeof server === 'undefined') {
    var eventsManager = require( './eventsManager.js' );
    var mongoHost = require('./config.example.js').mongo.host;
    var host = require('./config.example.js').redmine.host;
    var apiKey = require('./config.example.js').redmine.apiKey;
}
else {
    var eventsManager = server.eventsManager;
    var mongoHost = server.config.mongo.host;
    var host = server.config.redmine.host;
    var apiKey = server.config.redmine.apiKey;
}

//var EventEmitter = require('events').EventEmitter;
//var eventsManager = new EventEmitter();

require('./models.js');
Schema = mongoose.Schema;

var User = mongoose.model('User');
var Issue = mongoose.model('Issue');
var Project = mongoose.model('Project');
var TeamMember = mongoose.model('TeamMember');
var SkProject = mongoose.model('SkProjects');
var SkIssue = mongoose.model('SkIssues');

console.log("Issue : ", Issue);
//var db = mongoose.connect(server.config.mongo.host);
var db = mongoose.connect(mongoHost);

var redmineRest = new Redmine({
    //host: server.config.redmine.host,
    //apiKey: server.config.redmine.apiKey
    host: host,
    apiKey: apiKey
});

redmine.init = function() {
    //redmine.syncIssues();
    redmine.events();
};

redmine.events = function() {
    //eventsManager.emit('redmine::connect');

    eventsManager.on('redmine::sync', function(data){
        redmine.sync( function(err, data) {
        });
    });

    eventsManager.on('getDatabaseState', function(){
        eventsManager.emit('databaseState', {state: mongoose.connection.readyState});
    });

    eventsManager.on('setUsersIssues', function(callback){
        redmine.setUsersIssues( function(err, data) {
            //eventsManager.emit('log', data);
            callback(err, data);
        });
    });

    eventsManager.on('getUsers', function(callback){
        console.log("redmine getUsers : ");
        redmine.getUsers( function(err, data) {
            callback(err, data);
        });
    });

    eventsManager.on('getIssues', function(callback){
        console.log("redmine getIssues : ");
        redmine.getIssues( function(err, data) {
            callback(null, data);
        });
    });

    eventsManager.on('redmine::getUserIssues', function(id, callback){
        id = id.split('_')[1];
        eventsManager.emit('log', id);
        redmine.getUserIssues( id, function(err, data) {
            callback(data);
        });
    });

    eventsManager.on('setSkProjects', function(){
        console.log("setSkProjects : ");
        redmine.setSkProjects( function(err, data) {
            eventsManager.emit('log', data);
        });
    });
    eventsManager.on('getSkProjects', function(){
        redmine.getSkProjects( function(err, data) {
            eventsManager.emit('getSkProjects::response', data);
        });
    });

    eventsManager.on('redmine::getIssue', function(id, callback){
        redmine.getIssue( id, function(err, data) {
            callback(data);
        });
    });

    eventsManager.on('redmine::getCompleteIssue', function(id, callback){
        redmine.getCompleteIssue( id, function(err, data) {
            callback(err, data);
        });
    });

    eventsManager.on('syncIssues', function(){
        console.log("PUUUUUTE : ");
        redmine.syncIssues();
    });
};

redmine.sync = function( callback ) {
    console.log("===> redmine.js : synch");
    redmine.getAllProjects( callback );
    redmine.getAllUsers( callback );
    redmine.getAllIssues( callback );

    //redmine.getAll( 'projects', callback);
    //redmine.getAll( 'users', callback);
    //redmine.getAll( 'issues', callback);
};

redmine.getAll = function( itemModel, type, callback) {
    console.log("===> redmine.js : getAllProjects");

    //var itemModel = db.model(type, itemSchema);
    itemModel.collection.drop();

    var itemsCount;
    var lastItem = 0;
    var itemsList = [];

    var getAllItems = function() {
        console.log("lastItem : ", lastItem);
        console.log("itemsCount : ", itemsCount);
        if (lastItem === itemsCount) {
            callback( null, itemsList );
            //mongoose.connection.close();
            return;
        }

        redmineRest.getItems(type, {limit: 100, offset: lastItem}, function(err, data) {
            if (err) {
                console.log("error : ", err.message);
                return;
            }
            itemsCount = data.total_count;

            var items = data[type];
            //console.log("items : ", items);
            var loopCount = items.length;
            for (var i = 0; i < loopCount; i++) {
                lastItem++;
                itemsList.push( items[i] );
                //console.log("items[i]['id'] : ", items[i]['id']);

                var item = new itemModel( items[i] );
                item.redmine_id = items[i]['id'];
                item.type_id = type + '_' + items[i]['id'];
                console.log("item : ", item);
                //item.redmine_id = 'rstrstnrstnrstnrstnrstnrst';
                //item.commit('any');
                item.save();
            }
            //socket.emit('log', type + ':' + lastItem + '/' + itemsCount);
            getAllItems();
        });
    };
    getAllItems();
    return;
};

redmine.getAllIssues = function( callback ) {
    redmine.getAll(Issue, 'issues', callback);
    //redmine.getAll(Issues, 'Issue', callback);
};

redmine.getAllUsers = function( callback ) {
    redmine.getAll(User, 'users', callback);
    //redmine.getAll(Users, 'User', callback);
};


redmine.getAllProjects = function( callback ) {
    redmine.getAll(Project, 'projects', callback);
    //redmine.getAll(Projects, 'Project', callback);
};


redmine.getCompleteIssue = function( id, callback ) {
    redmineRest.getIssueParams(id, {include: 'journals'}, function(err, data) {
        //console.log("data : ", data);
        var journals = [];
        var loopCount = data.issue.journals.length;
        for (var i = 0; i < loopCount; i++) {
            //data.issue.journals[i].notes = textile(data.issue.journals[i].notes);
        }
        delete loopCount;
        //callback(err, journals);
        callback(err, data);
    });
    //redmine.getAll(Projects, 'Project', callback);
};

redmine.setUsersIssues = function( callback ) {

    TeamMember.collection.drop();

    User.where('mail')
        //.$regex('@internethic')
        .$regex(server.config.redmine.mailFilter)
        .each(function(err, doc) {
            if (doc) {
                //callback( null, assignedIssues );
                var skUser = new TeamMember({
                    id: doc.id,
                    type_id: doc.type_id,
                    current: doc.current,
                    login: doc.login,
                    name: doc.firstname + ' ' + doc.lastname,
                    redmine: {
                        login: doc.login,
                        firstname: doc.firstname,
                        lastname: doc.lastname
                    }
                });

                console.log("doc.lastname : ", doc.lastname);
                console.log("doc.firstname : ", doc.firstname);

                //Issue.find({ 'assigned_to.name': doc.firstname + ' ' + doc.lastname }, function (err, docs) {
                //Issue.find({ 'assigned_to.name': doc.firstname + ' ' + doc.lastname })
                //Issue.find({ 'assigned_to.name': doc.firstname + ' ' + doc.lastname }, ['id', 'type_id', 'subject', 'priority', 'project'])
                Issue.find({ 'assigned_to.name': doc.firstname + ' ' + doc.lastname }, ['id'])
                    .sort('priority.id', -1, 'project.name', 1)
                    .run(function (err, docs) {
                        callback( err, docs );
                        skUser.redmine.issues = docs;
                        skUser.redmine.issuesCount = docs.length;
                        //console.log("docs : ", docs);
                        skUser.save();
                });
            }
        });
};

redmine.getUsers = function( callback ) {
    TeamMember.find({}, function (err, docs) {
        //eventsManager.emit('getUsers::response', docs);
        callback(err, docs);
    });
};

redmine.getUserIssues = function( id, callback ) {
    //callback(null, id);
    TeamMember.findOne({id: id}, function (err, doc) {
            //socket.emit('log', doc);
            eventsManager.emit('log', doc);
        //Issue.find({ 'assigned_to.name': doc.redmine.firstname + ' ' + doc.redmine.lastname }, ['id', 'type_id', 'subject', 'priority', 'project'])
        Issue.find({ 'assigned_to.name': doc.redmine.firstname + ' ' + doc.redmine.lastname })
            .sort('priority.id', -1, 'project.name', 1)
            .run(function (err, docs) {
                callback( err, docs );
                //socket.emit('log', docs);
                eventsManager.emit('log', docs);
                //skUser.redmine.issues = docs;
                //skUser.redmine.issuesCount = docs.length;
                console.log("docs : ", docs);
                //skUser.save();
        });
    });
};

redmine.getIssues = function( callback ) {
    Issue.find({}, function (err, docs) {
        //doc.description = textile(doc.description);
        callback(err, docs);
    });
};

redmine.getIssue = function( id, callback ) {
    Issue.findOne({ type_id: id  }, function (err, doc) {
        //doc.description = textile(doc.description);
        callback(null, doc);
    });
};

redmine.setSkProjects = function( callback ) {

    SkProject.collection.drop();

    Project.find().each(function(err, doc) {
        console.log("err : ", err);
        console.log("doc : ", doc);
        if (doc) {
            //callback( null, assignedIssues );
            var skProject = new SkProject({
                id: doc.id,
                created_on: doc.created_on,
                description: doc.description,
                updated_on: doc.updated_on,
                identifier: doc.identifier,
                name: doc.name
            });

            console.log( doc.id,  " : ", doc.name);
            //skProject.save();

            Issue.find({ 'project.id': doc.id }, function (err, docs) {
                //callback( null, docs );
                if (docs.length) {
                    skProject.issues = docs;
                    skProject.save();
                }
            });
        }
    });
};

redmine.getSkProjects = function( callback ) {
    SkProject.find({  }, function (err, docs) {
        callback(null, docs);
    });
};

redmine.syncIssues = function() {
    var checkLastIssue = function(offset) {
        console.log(" ========== »»»» checkLastIssue : ");
        offset = offset || 0;
        redmineRest.getIssues({limit: '1', sort: 'updated_on:desc', offset: offset}, function(err, data) {
            if (data.issues) {
                var lastRedmineDate = new Date(data.issues[0].updated_on);
                var redmineIssue = data.issues[0];
                Issue.findOne({ 'id': redmineIssue.id }, function (err, doc) {
                    console.log("err : ", err);
                    if (doc) {
                        var lastMongoDate = new Date(doc.updated_on);
                        if (lastRedmineDate > lastMongoDate) {
                            console.log("UPDATE NEEDED : ", redmineIssue.id);
                            updateIssue(redmineIssue);
                            checkLastIssue(++offset);
                        }
                        else {
                            console.log("issue up to date : ", redmineIssue.id);
                            //socket.emit('log', "issue up to date : " + redmineIssue.id);
                        }
                    }
                    else {
                        console.log("CREATE NEEDED : ", redmineIssue.id);
                        createIssue(redmineIssue);
                        checkLastIssue(++offset);
                    }
                });
            }
        });
    };
    checkLastIssue();
    setInterval(checkLastIssue, 10 * 1000);

    var createIssue = function(redmineIssue) {
        console.log("creating issue : ");
        var issue = new Issue(redmineIssue);
        issue.save();
        //socket.emit('createIssue', issue);
        eventsManager.emit('createIssue', issue);
    };

    var updateIssue = function(redmineIssue, callback) {
        console.log("updating issue : ", redmineIssue.id);
        Issue.remove({id: redmineIssue.id}, function() {
            var issue = new Issue(redmineIssue);
            issue.save();
            //socket.emit('updateIssue', issue);
            eventsManager.emit('updateIssue', issue);
        });
        /*
         *Issue.update({id: redmineIssue.id}, redmineIssue, {}, function(err, numAffected) {
         *}).run(function(err, doc) {
         *    Issue.findOne({ 'id': redmineIssue.id }, function (err, issue) {
         *        socket.emit('updateIssue', issue);
         *    });
         *});
         */
    };
};

module.exports = redmine;
