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

var Issue = function(){
    var mongoose = require('mongoose');
    var Schema = require('mongoose').Schema;
    var issueSchema = new Schema({
        id: { type: Number, default: 000 },
        type_id: String,
        created_on: String,
        start_date: String,
        description: String,
        status: { name: String, id: Number },
        done_ratio: Number,
        project: { name: String, id: Number },
        author: { name: String, id: Number },
        updated_on: String,
        due_date: String,
        tracker: { name: String, id: Number },
        subject: String,
        assigned_to: { name: String, id: Number },
        priority: { name: String, id: Number }
    });

    var _model = mongoose.model('Issue', issueSchema);

    var _store = function(schema, callback) {
        var issue = new _model(schema);
        issue.save();
        callback(issue);
    };
    var _getAll = function(success, fail) {
        _model.find({}, function(e, docs){
            if(e){
                fail(e);
            }else{
                success(docs);
            }
        });
    };
    var _findById = function(id, success, fail){
        _model.findOne({id:id}, function(e, doc){
            if(e){
                fail(e);
            }else{
                success(doc);
            }
        });
    };
    return {
        schema : issueSchema,
        model : _model,
        store : _store,
        getAll : _getAll,
        findById : _findById
    };
}();

module.exports = Issue;
