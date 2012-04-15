console.log("»»»»»redmine load««««««");
var redmine ={},
    Redmine = require('./redmine-rest.js'),
    //irc = require('irc'),
    bcrypt = require('bcrypt'),
    mongoose = require('mongoose');

//console.log("config : ", config);

Schema = mongoose.Schema;

var Users = new Schema({
    /*
     *login: { 
     *    type: String,
     *    index: {
     *        unique: true
     *    }
     *},
     *password: String,
     *redmine: {
     *    login: String,
     *    firstname: String,
     *    lastname: String,
     *    apikey: String
     *}
     */
    id: Number,
    last_login_on: String,
    created_on: String,
    mail: String,
    login: String,
    firstname: String,
    lastname: String
});

var Issues = new Schema({
    id: { type: Number, default: 000 },
    created_on: String,
    start_date: String,
    description: String,
    status: {
        name: String,
        id: Number
    },
    done_ratio: Number,
    project: {
        name: String,
        id: Number
    },
    author: {
        name: String,
        id: Number
    },
    updated_on: String,
    due_date: String,
    tracker: {
        name: String,
        id: Number
    },
    subject: String,
    assigned_to: {
        name: String,
        id: Number
    },
    priority: {
        name: String,
        id: Number
    }
});

var Projects = new Schema({
    id: Number,
    created_on: String,
    description: String,
    updated_on: String,
    identifier: String,
    name: String
});

var SkUsers = new Schema({
    id: Number,
    login: { 
        type: String,
        index: {
            unique: true
        }
    },
    name: String,
    password: String,
    current: { type: String, default: 'Aucune' },
    redmine: {
        login: String,
        firstname: String,
        lastname: String,
        apikey: String,
        issues: {}
    }
});

var SkProjects = new Schema({
    id: Number,
    created_on: String,
    description: String,
    updated_on: String,
    identifier: String,
    name: String,
    issues: {}
});

var SkIssues = new Schema({
    id: Number,
    description: String,
    assigned_to: {
        name: String,
        id: Number
    }
});

var User = mongoose.model('User', Users);
var Issue = mongoose.model('Issue', Issues);
var Project = mongoose.model('Project', Projects);
var SkUser = mongoose.model('SkUser', SkUsers);
var SkProject = mongoose.model('SkProjects', SkProjects);
var SkIssue = mongoose.model('SkIssues', SkIssues);

var db = mongoose.connect(config.mongo.host);

var redmineRest = new Redmine({
    host: config.redmine.host,
    apiKey: config.redmine.apiKey
});

redmine.init = function() {
    //this.sync( function() {} );

    io.sockets.on('connection', function(socket){
        /*
         *redmine.getUsersIssues( function(err, data) {
         *    socket.emit('getUsersIssues::response', data);
         *});
         */

        socket.emit('redmine::connect');

        socket.on('redmine::sync', function(data){
            redmine.sync( function(err, data) {
                //socket.emit('redmine::response', data);
            });
            //socket.broadcast.emit('server_message',data);
            //socket.emit('server_message',data);
        });

        socket.on('getDatabaseState', function(){
            socket.emit('databaseState', {state: mongoose.connection.readyState});
        });

        socket.on('setUsersIssues', function(){
            redmine.setUsersIssues( function(err, data) {
                //socket.emit('redmine::response', data);
                socket.emit('log', data);
            });
        });
        socket.on('getUsersIssues', function(){
            redmine.getUsersIssues( function(err, data) {
                socket.emit('getUsersIssues::response', data);
            });
        });

        socket.on('setSkProjects', function(){
            console.log("setSkProjects : ");
            redmine.setSkProjects( function(err, data) {
                //socket.emit('redmine::response', data);
                socket.emit('log', data);
            });
        });
        socket.on('getSkProjects', function(){
            redmine.getSkProjects( function(err, data) {
                socket.emit('getSkProjects::response', data);
                //socket.emit('log', data);
            });
        });
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

redmine.getAll = function( itemSchema, type, callback) {
    console.log("===> redmine.js : getAllProjects");

    //var db = mongoose.connect(config.mongo.host);

    //var Schema = db.Schema;
    //var itemSchema = new Schema({ any: {} });
    var itemModel = db.model(type, itemSchema);
    /*
     *io.sockets.on('connection', function(socket){
     *    socket.emit('redmine::response', itemModel);
     *});
     */
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
            console.log("items : ", items);
            var loopCount = items.length;
            for (var i = 0; i < loopCount; i++) {
                lastItem++;
                itemsList.push( items[i] );
                //console.log("items[i]['id'] : ", items[i]['id']);

                var item = new itemModel( items[i] );
                item.redmine_id = items[i]['id'];
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
    redmine.getAll(Issues, 'issues', callback);
    //redmine.getAll(Issues, 'Issue', callback);
};

redmine.getAllUsers = function( callback ) {
    redmine.getAll(Users, 'users', callback);
    //redmine.getAll(Users, 'User', callback);
};


redmine.getAllProjects = function( callback ) {
    redmine.getAll(Projects, 'projects', callback);
    //redmine.getAll(Projects, 'Project', callback);
};

redmine.setUsersIssues = function( callback ) {

    SkUser.collection.drop();

    User.where('mail')
        .$regex('@internethic')
        .each(function(err, doc) {
            if (doc) {
                //callback( null, assignedIssues );
                var skUser = new SkUser({
                    id: doc.id,
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
                Issue.find({ 'assigned_to.name': doc.firstname + ' ' + doc.lastname }, ['id', 'subject', 'priority'])
                    .sort('priority.id', -1, 'project.name', 1)
                    .run(function (err, docs) {
                        //callback( null, docs );
                        skUser.redmine.issues = docs;
                        console.log("docs : ", docs);
                        skUser.save();
                });
            }
        });
};

redmine.getUsersIssues = function( callback ) {
    SkUser.find({  }, function (err, docs) {
        callback(null, docs);
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

module.exports = redmine;
