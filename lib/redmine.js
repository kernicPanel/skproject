console.log("»»»»»redmine load««««««");
var redmine ={},
    Redmine = require('./redmine-rest.js');

//console.log("config : ", config);

io.sockets.on('connection', function(socket){
    console.log('Client Connected on redmine');
    socket.emit('redmine::connect');
    socket.on('redmine::sync', function(data){
        redmine.sync( socket,  function(err, data) {
            socket.emit('redmine::response', data);
        });
        socket.broadcast.emit('server_message',data);
        socket.emit('server_message',data);
    });
    /*
     *socket.on('redmine::sync', function (name, fn) {
     *    redmine.sync( socket,  function(err, data) {
     *        socket.emit('redmine::response', data);
     *    });
     *    fn('woot');
     *});
     */
    socket.on('disconnect', function(){
        console.log('Client Disconnected.');
    });
});

var redmineRest = new Redmine({
    host: config.redmine.host,
    apiKey: config.redmine.apiKey
});

redmine.sync = function( socket,  callback ) {
    console.log("===> redmine.js : synch");
    //redmine.getAllProjects( callback );
    //redmine.getAllUsers( callback );
    //redmine.getAllIssues( callback );
    redmine.getAll( socket, 'projects', callback);
    redmine.getAll( socket, 'users', callback);
    redmine.getAll( socket, 'issues', callback);
};

redmine.getAll = function( socket, type, callback) {
    console.log("===> redmine.js : getAllProjects");

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

                var item = new itemModel( itemsList[i] );
                item.commit('any');
                item.save();
            }
            socket.emit('log', type + ':' + lastItem + '/' + itemsCount);
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


module.exports = redmine;
