console.log("»»»»»redmine load««««««");
var redmine ={},
    Redmine = require('./redmine-rest.js');

//console.log("config : ", config);

io.sockets.on('connection', function(socket){
    console.log('Client Connected on redmine');
    socket.emit('redmine::connect');
    socket.on('redmine::sync', function(data){
        //socket.emit('log', redmine.sync() );
        //redmine.sync();
        //redmine.sync( socket.emit('log', 'tsrrstrstrstr'));
        redmine.sync( function(err, data) {
            socket.emit('log', data);
        });
        socket.broadcast.emit('server_message',data);
        socket.emit('server_message',data);
    });
    socket.on('disconnect', function(){
        console.log('Client Disconnected.');
    });
});

var redmineRest = new Redmine({
    host: config.redmine.host,
    apiKey: config.redmine.apiKey
});

redmine.sync = function( callback ) {
    console.log("===> redmine.js : synch");
    redmine.getAllProjects( callback );
    redmine.getAllUsers( callback );
    redmine.getAllIssues( callback );
};

redmine.getAllIssues = function( callback ) {
    console.log("===> redmine.js : getAllProjects");

    var Schema = db.Schema;
    var issueSchema = new Schema({ any: {} });
    var issueModel = db.model('issue', issueSchema);
    issueModel.collection.drop();

    var issuesCount;
    var lastIssue = 0;
    var issuesList = [];

    var getAllIssues = function() {
        console.log("lastIssue : ", lastIssue);
        console.log("issuesCount : ", issuesCount);
        if (lastIssue === issuesCount) {
            callback( null, issuesList );
            return;
        }

        redmineRest.getIssues({limit: 100, offset: lastIssue}, function(err, data) {
            if (err) {
                console.log("error : ", err.message);
                return;
            }
            issuesCount = data.total_count;

            var issues = data.issues;
            var loopCount = issues.length;
            for (var i = 0; i < loopCount; i++) {
                lastIssue++;
                issuesList.push( issues[i] );

                var issue = new issueModel( issuesList[i] );
                issue.commit('any');
                issue.save();
            }
            getAllIssues();
        });
    };
    getAllIssues();
    return;
};

redmine.getAllUsers = function( callback ) {
    console.log("===> redmine.js : getAllProjects");

    var Schema = db.Schema;
    var userSchema = new Schema({ any: {} });
    var userModel = db.model('User', userSchema);
    userModel.collection.drop();

    var usersCount;
    var lastUser = 0;
    var usersList = [];

    var getAllUsers = function() {
        console.log("lastUser : ", lastUser);
        console.log("usersCount : ", usersCount);
        if (lastUser === usersCount) {
            callback( null, usersList );
            return;
        }

        redmineRest.getUsers({limit: 100, offset: lastUser}, function(err, data) {
            if (err) {
                console.log("error : ", err.message);
                return;
            }
            usersCount = data.total_count;

            var users = data.users;
            var loopCount = users.length;
            for (var i = 0; i < loopCount; i++) {
                lastUser++;
                usersList.push( users[i] );

                var user = new userModel( usersList[i] );
                user.commit('any');
                user.save();
            }
            getAllUsers();
        });
    };
    getAllUsers();
    return;
};


redmine.getAllProjects = function( callback ) {
    console.log("===> redmine.js : getAllProjects");

    var Schema = db.Schema;
    var ProjectSchema = new Schema({ any: {} });
    var ProjectModel = db.model('projet', ProjectSchema);
    ProjectModel.collection.drop();

    var projectsCount;
    var lastProject = 0;
    var projectsList = [];

    var getAllProjects = function() {
        console.log("lastProject : ", lastProject);
        console.log("projectsCount : ", projectsCount);
        if (lastProject === projectsCount) {
            callback( null, projectsList );
            return;
        }

        redmineRest.getProjects({limit: 100, offset: lastProject}, function(err, data) {
            if (err) {
                console.log("error : ", err.message);
                return;
            }
            projectsCount = data.total_count;

            var projects = data.projects;
            var loopCount = projects.length;
            for (var i = 0; i < loopCount; i++) {
                lastProject++;
                projectsList.push( projects[i] );

                var project = new ProjectModel( projectsList[i] );
                project.commit('any');
                project.save();
            }
            getAllProjects();
        });
    };
    getAllProjects();
    return;
};


module.exports = redmine;
