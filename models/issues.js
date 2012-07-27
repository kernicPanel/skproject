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
