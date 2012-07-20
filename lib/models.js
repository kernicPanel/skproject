var mongoose = require('mongoose');

Schema = mongoose.Schema;

var Users = new Schema({
    id: Number,
    type_id: String,
    last_login_on: String,
    created_on: String,
    mail: String,
    login: String,
    firstname: String,
    lastname: String
});

var Issues = new Schema({
    id: { type: Number, default: 000 },
    type_id: String,
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
    type_id: String,
    created_on: String,
    description: String,
    updated_on: String,
    identifier: String,
    name: String
});

var SkUsers = new Schema({
    id: Number,
    type_id: String,
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
        issuesCount: Number,
        issues: {}
    }
});

var SkProjects = new Schema({
    id: Number,
    type_id: String,
    created_on: String,
    description: String,
    updated_on: String,
    identifier: String,
    name: String,
    issues: {}
});

var SkIssues = new Schema({
    id: Number,
    type_id: String,
    description: String,
    assigned_to: {
        name: String,
        id: Number
    }
});

var Detail = new Schema({
    name: String,
    property: String,
    old_value: String,
    new_value: String
});

var Journal = new Schema({
    id: Number,
    issueId: Number,
    user: {
        name: String,
        id: Number
    },
    notes: String,
    created_on: Date,
    details: [Detail]
});

var TimeEntry = new Schema({
    id: Number,
    project: {
        name: String,
        id: Number
    },
    issue_id: Number,
    user: {
        name: String,
        id: Number
    },
    activity: {
        name: String,
        id: Number
    },
    hours: Number,
    comment: String,
    spent_on: Date,
    created_on: Date,
    updated_on: Date
});

var Stats = new Schema({
});

var IssuesExtract = new Schema({
    id: { type: Number, default: 0 },
    type_id: String,
    created_on: Date,
    start_date: Date,
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
    updated_on: Date,
    due_date: Date,
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
    },
    journals: [Journal],
    time_entries: [TimeEntry],
    stats: {
        dateFirstPost: Date,
        dateAValider: Date,
        dateALivrer: Date,
        dateLivre: Date,
        dateFerme: Date,
        delaiFirstPost: Number,
        delaiAValider: Number,
        delaiALivrer: Number,
        delaiLivre: Number,
        time: Number
    }
    //journals: [],
    //time_entries: []
});

Journal.statics.dateFirstPost = function dateFirstPost (journalsID, callback) {
    var query = this.findOne();
    query.where('id').in(journalsID);
    //query.sort('created_on', 1);
    query.sort('id', 1);
    //query.limit(1);
    query.only('created_on');
    query.exec(callback);
    //return this.where('id').in(journalsID).sort('id', -1).limit(1).only('created_on').exec(callback);
};

IssuesExtract.methods.getFirstJournal = function getFirstJournal (callback) {
    //return this.model('Journal').find({'issue.id': this.id}).sort('id', -1).exec(callback);
    this.model('Journal').find({'issue.id': this.id}).sort('id', -1).exec(callback);
};

IssuesExtract.methods.buildStats = function buildStats (callback) {
    console.log("buildStat : ");
    //console.log("this : ", this.find());
    //return this.model('IssueExtract').find({ type: this.type }, callback);
    var journalsID = [];
    var loopCount = this.journals.length;
    for (var i = 0; i < loopCount; i++) {
        var journal = this.journals[i];
        journalsID.push(journal.id);
    }
    delete loopCount;
    
    /*
     *Journal.where('id').in(journalsID).sort('journals.id', -1).exec(function(journal) {
     *    console.log("journal : ", journal);
     *});
     */
    
    Journal.dateFirstPost(journalsID, function(journals) {
        console.log("journals : ", journals);
    });

    this.stats = {
        dateFirstPost: new Date(),
        dateAValider: new Date(),
        dateALivrer: new Date(),
        dateLivre: new Date(),
        dateFerme: new Date(),
        delaiFirstPost: 12,
        delaiAValider: 12,
        delaiALivrer: 12,
        delaiLivre: 12,
        time: 12
    };
    this.save();
    callback(null, this);
};

IssuesExtract.statics.buildStats = function buildStats (callback) {
    /*
     *console.log("this : ", this);
     *var query = this.find({});
     *query.sort('project.name', 1);
     *query.sort('created_on', 1);
     *query.limit(10);
     *query.exec( function (err, docs) {
     *    callback(err, docs);
     *});
     */

    var query = this.find({});
    query.sort('project.name', 1);
    query.sort('created_on', 1);
    //query.only('id');
    //query.only('journals.id');
    query.limit(10);

    var stream = query.stream();
    //var stream = this.find().limit(10).stream();

    stream.on('data', function (doc) {
        console.log("doc watta watta : ", doc.journals);
        //doc.buildStats(callback);
        //doc.buildStats(function() {});
    var journalsID = [];
    var loopCount = doc.journals.length;
    for (var i = 0; i < loopCount; i++) {
        var journal = doc.journals[i];
        journalsID.push(journal.id);
    }
    delete loopCount;
    Journal.dateFirstPost(journalsID, function(journals) {
        console.log("journals : ", journals);
    });

/*
 *        if (somethingHappened) {
 *            this.pause();
 *
 *            var self = this;
 *            return bakeSomePizza(function () {
 *                self.resume();
 *            });
 *        }
 *
 *        res.write(doc);
 */
    });

    stream.on('error', function (err) {
        // handle err
    });

    stream.on('close', function () {
        // all done
        console.log("stream done !");
        callback();
    });
};

mongoose.model('User', Users);
mongoose.model('Issue', Issues);
mongoose.model('Detail', Detail);
mongoose.model('Journal', Journal);
mongoose.model('TimeEntry', TimeEntry);
mongoose.model('IssueExtract', IssuesExtract);
mongoose.model('Project', Projects);
mongoose.model('SkUser', SkUsers);
mongoose.model('SkProjects', SkProjects);
mongoose.model('SkIssues', SkIssues);
