var mongoose = require('mongoose');
var config = require('./config');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var AppUsers = new Schema({
    id: Number,
    type_id: String,
    last_login_on: String,
    created_on: String,
    mail: String,
    username: { type: String, required: true, index: { unique: true } },
    firstname: { type: String, required: true },
    lastname: String,
    password: String,
    apiKey: String,
    currentTask: {
      id: { type: String, default: null },
      startedAt: { type: Date, default: 0 },
      paused: { type: Boolean, default: false },
      pendingDuration: { type: Number, default: 0 }
    }
});

AppUsers.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });

});

AppUsers.methods.comparePassword = function(candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};

AppUsers.methods.startIssue = function( id, callback ){
  console.log("model id : ", id);
  if (this.currentTask.id) {
    this.stopIssue( callback );
  }
  this.currentTask.id = id;
  this.currentTask.paused = false;
  this.currentTask.startedAt = new Date();
  this.save();
  callback( null, this.currentTask.startedAt );
};

AppUsers.methods.pauseIssue = function( callback ){
  if (this.currentTask.paused) {
    this.currentTask.paused = false;
    this.currentTask.startedAt = new Date();
  }
  else {
    this.currentTask.paused = true;
    this.currentTask.pendingDuration = this.currentTask.pendingDuration + (new Date() - this.currentTask.startedAt);
  }
  this.save();
  callback( null, this.currentTask.pendingDuration );
};

AppUsers.methods.stopIssue = function( callback ){
  //var totalDuration = this.currentTask.pendingDuration + new Date() - this.currentTask.startedAt;
  if (!this.currentTask.paused) {
    this.currentTask.pendingDuration = this.currentTask.pendingDuration + (new Date() - this.currentTask.startedAt);
  }
  this.save();
  callback( null, this.currentTask );

  this.currentTask.id = null;
  this.currentTask.paused = false;
  this.currentTask.startedAt = 0;
  this.currentTask.pendingDuration = 0;
  this.save();
};

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

var TeamMembers = new Schema({
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
    issueId: Number,
    created_on: Date,
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
    time_entriesTotal: Number,
    stats: {
        dateFirstPost: Date,
        dateAValider: Date,
        dateALivrer: Date,
        dateLivre: Date,
        dateFerme: Date,
        dateRejete: Date,
        delaiFirstPost: Number,
        delaiFirstPostJourOuvre: Number,
        delaiAValider: Number,
        delaiAValiderJourOuvre: Number,
        delaiALivrer: Number,
        delaiALivrerJourOuvre: Number,
        delaiLivre: Number,
        delaiLivreJourOuvre: Number,
        delaiFerme: Number,
        delaiFermeJourOuvre: Number,
        delaiRejete: Number,
        delaiRejeteJourOuvre: Number,
        userFirstPost: String,
        time: Number
    }
    //journals: [],
    //time_entries: []
});

var team = config.extract.team;
Journal.statics.firstPost = function firstPost (journalsID, callback) {
    var query = this.findOne();
    query.where('id').in(journalsID);
    query.where('user.name').in(team);
    query.sort('id', 1);
    query.select('created_on', 'user.name');
    query.exec(callback);
};

Journal.statics.firstStatus = function firstStatus (journalsID, status, callback) {
    var query = this.findOne();
    query.where('id').in(journalsID);
    //query.where('details.name', 'status_id');
    //query.where('details.new_value', status);
    query.where('details').elemMatch(function (elem) {
          elem.where('name', 'status_id');
          elem.where('new_value', status);
    });
    query.sort('id', 1);
    query.select('created_on', 'user.name', 'issueId', 'details');
    //console.log("query : ", query);
    query.exec(callback);
};

Journal.statics.firstAValider = function firstAValider (journalsID, callback) {
    this.firstStatus(journalsID, '10', callback);
};

Journal.statics.firstALivrer = function firstALivrer (journalsID, callback) {
    this.firstStatus(journalsID, '15', callback);
};

Journal.statics.firstLivre = function firstLivre (journalsID, callback) {
    this.firstStatus(journalsID, '3', callback);
};

Journal.statics.firstFerme = function firstFerme (journalsID, callback) {
    this.firstStatus(journalsID, '5', callback);
};

Journal.statics.firstRejete = function firstRejete (journalsID, callback) {
    this.firstStatus(journalsID, '6', callback);
};

IssuesExtract.methods.getFirstJournal = function getFirstJournal (callback) {
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

mongoose.model('AppUser', AppUsers);
mongoose.model('User', Users);
mongoose.model('Issue', Issues);
mongoose.model('Detail', Detail);
mongoose.model('Journal', Journal);
mongoose.model('TimeEntry', TimeEntry);
mongoose.model('IssueExtract', IssuesExtract);
mongoose.model('Project', Projects);
mongoose.model('TeamMember', TeamMembers);
mongoose.model('SkProjects', SkProjects);
mongoose.model('SkIssues', SkIssues);
