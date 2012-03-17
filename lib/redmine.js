exports.sync = function(db) {
    console.log("===> test.js : echo");
    var Redmine = require('redmine');
    var Schema = db.Schema;
    var ProjectSchema = new Schema({ any: {} });
    var ProjectModel = db.model('projet', ProjectSchema);
    ProjectModel.collection.drop();
    var redmine = new Redmine({
        host: config.redmine.host,
        apiKey: config.redmine.apiKey
    });
    var projectsCount;
    var lastProject = 0;
    var projectsList = [];


    var getAllProjects = function() {
        console.log("lastProject : ", lastProject);
        console.log("projectsCount : ", projectsCount);
        if (lastProject === projectsCount) {
            return;
        }

        redmine.getProjects({limit: 100, offset: lastProject}, function(err, data) {
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

    app.socket.sockets.on('connection', function(socket){
        //console.log("connect : ");
        socket.emit('log', projectsList.length);
        socket.emit('log', projectsList);
    });

    /*
     *var loopCount = projectsList.length;
     *for (var i = 0; i < loopCount; i++) {
     *    var project = new ProjectModel( projectsList[i] );
     *    project.commit('any');
     *    project.save();
     *}
     *delete loopCount;
     */

/*
 *    redmine.getAllProjects( function(err, data) {
 *        if (err) {
 *            console.log("error : ", err.message);
 *            return;
 *        }
 *        //console.log("projects : ", data);
 *        //console.log("app.socket : ", app.socket);
 *
 *        app.socket.sockets.on('connection', function(socket){
 *            //console.log("connect : ");
 *            socket.emit('log', data);
 *        });
 *        var projects = data.projects;
 *        var loopCount = projects.length;
 *        for (var i = 0; i < loopCount; i++) {
 *            var project = new ProjectModel( projects[i] );
 *            //console.log("project : ", project);
 *             //Project.markModified('any');
 *            project.commit('any');
 *            project.save();
 *        }
 *        delete loopCount;
 *    });
 */
    return;
};
