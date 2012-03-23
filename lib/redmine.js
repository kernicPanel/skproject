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
    last_login_on: String,
    created_on: String,
    mail: String,
    login: String,
    firstname: String,
    lastname: String
});

var Issues = new Schema({
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
    created_on: String,
    description: String,
    updated_on: String,
    identifier: String,
    name: String
});

var User = mongoose.model('User', Users);
var Issue = mongoose.model('Issue', Issues);
var Project = mongoose.model('Project', Projects);

var db = mongoose.connect(config.mongo.host);

var redmineRest = new Redmine({
    host: config.redmine.host,
    apiKey: config.redmine.apiKey
});

redmine.init = function() {
    //this.sync( function() {} );

    io.sockets.on('connection', function(socket){
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

        socket.on('getUsersIssues', function(){
            redmine.getUsersIssues( function(err, data) {
                socket.emit('redmine::response', data);
            });
        });
    });
};

redmine.sync = function( callback ) {
    console.log("===> redmine.js : synch");
    //redmine.getAllProjects( callback );
    //redmine.getAllUsers( callback );
    //redmine.getAllIssues( callback );

    redmine.getAll( 'projects', callback);
    redmine.getAll( 'users', callback);
    redmine.getAll( 'issues', callback);
};

redmine.getAll = function( type, callback) {
    console.log("===> redmine.js : getAllProjects");

    //var db = mongoose.connect(config.mongo.host);

    var Schema = db.Schema;
    var itemSchema = new Schema({ any: {} });
    var itemModel = db.model(type, itemSchema);
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
            var loopCount = items.length;
            for (var i = 0; i < loopCount; i++) {
                lastItem++;
                itemsList.push( items[i] );

                var item = new itemModel( items[i] );
                item.commit('any');
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
    redmine.getAll('issues', callback);
};

redmine.getAllUsers = function( callback ) {
    redmine.getAll('users', callback);
};


redmine.getAllProjects = function( callback ) {
    redmine.getAll('projects', callback);
};

redmine.getUsersIssues = function( callback ) {
    //var db = mongoose.connect(config.mongo.host);

    var usersNames = [];
    var assignedIssues = [];
    User.find({}, ['firstname', 'lastname'], function (err, doc){
        var loopCount = doc.length;
        for (var i = 0; i < loopCount; i++) {
            usersNames.push( doc[i].firstname + ' ' + doc[i].lastname);
        }
        delete loopCount;
        //callback( null, usersNames );
        //console.log("Issue : ", Issue);
        console.log("usersNames : ", usersNames);
        getIssues(callback);
    });

    var getIssues = function(callback) {
        console.log("getIssues : ");
        // body...
        Issue.where('assigned_to.name')
            .in(usersNames)
            //.in(['Nicolas Clerc'])
            //.run( callback );
            .run(function(err, doc) {
                assignedIssues = doc;
                callback( null, assignedIssues );
                //mongoose.connection.close();
            });
    };
};


module.exports = redmine;
