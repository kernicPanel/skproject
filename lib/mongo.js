/*

Copyright (c) 2012 Nicolas Clerc <kernicpanel@nclerc.fr>

This file is part of redLive.

redLive is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

redLive is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with redLive.  If not, see <http://www.gnu.org/licenses/>.

*/

console.log("»»»»»mongo load««««««");
var mongo ={};

//console.log("config : ", config);

io.sockets.on('connection', function(socket){
    console.log('Client Connected on mongo');
    socket.emit('mongo::connect');
    socket.on('mongo::initObjects', function(data){
        mongo.initObjects( socket,  function(err, data) {
            socket.emit('mongo::response', data);
        });
        socket.broadcast.emit('server_message',data);
        socket.emit('server_message',data);
    });
    /*
     *socket.on('mongo::initObjects', function (name, fn) {
     *    mongo.initObjects( socket,  function(err, data) {
     *        socket.emit('mongo::response', data);
     *    });
     *    fn('woot');
     *});
     */
    socket.on('disconnect', function(){
        console.log('Client Disconnected.');
    });
});

mongo.initObjects = function( socket,  callback ) {
    console.log("===> mongo.js : synch");
    Users = db.model('users', users);
    //Model.find({ 'some.value': 5 }, function (err, docs) {
    Users.find({  }, function (err, docs) {
        callback(docs);
    });
    //mongo.getAllProjects( callback );
    //mongo.getAllUsers( callback );
    //mongo.getAllIssues( callback );
    //mongo.getAll( socket, 'projects', callback);
    //mongo.getAll( socket, 'users', callback);
    //mongo.getAll( socket, 'issues', callback);
};

mongo.getAll = function( socket, type, callback) {
    console.log("===> mongo.js : getAllProjects");

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
            //socket.emit('log', type + ':' + lastItem + '/' + itemsCount);
            getAllItems();
        });
    };
    getAllItems();
    return;
};

mongo.getAllIssues = function( callback ) {
    mongo.getAll('issues', callback);
};

mongo.getAllUsers = function( callback ) {
    mongo.getAll('users', callback);
};


mongo.getAllProjects = function( callback ) {
    mongo.getAll('projects', callback);
};


module.exports = mongo;
