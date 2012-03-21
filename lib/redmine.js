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

// get issue
/*
 *redmineRest.getIssues({project_id: 296}, function(err, data) {
 *    if (err) {
 *        console.log("Error: " + err.message);
 *        return;
 *    }
 *
 *    console.log("Issues:");
 *    console.log(data);
 *});
 */

redmine.sync = function( callback ) {
    console.log("===> redmine.js : synch");
    //var Redmine = require('redmine');
    var Schema = db.Schema;
    var ProjectSchema = new Schema({ any: {} });
    var ProjectModel = db.model('projet', ProjectSchema);
    ProjectModel.collection.drop();
    /*
     *var redmine = new Redmine({
     *    host: config.redmine.host,
     *    apiKey: config.redmine.apiKey
     *});
     */
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
    //console.log(">>>> app : ", app);
    getAllProjects();

    /*
     *app.socket.sockets.on('connection', function(socket){
     *    //console.log("connect : ");
     *    socket.emit('log', projectsList.length);
     *    socket.emit('log', projectsList);
     *});
     */

    //callback( projectsList );
    //return projectsList;
    return;
};


module.exports = redmine;
