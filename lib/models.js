/*

Copyright (c) 2012 Nicolas Clerc <kernicpanel@nclerc.fr>

This file is part of realTeam.

realTeam is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

realTeam is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with realTeam.  If not, see <http://www.gnu.org/licenses/>.

*/

var mongoose = require('mongoose');
var config = require('./config');
var Schema = mongoose.Schema;
var ObjectId = mongoose.ObjectId;

var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var crypto = require('crypto');
var algorithm = config.crypto.algorithm;
var key = config.crypto.key;

var Users = new Schema({
    id: { type: Number, unique: true, index: true },
    //type_id: String,
    last_login_on: String,
    created_on: String,
    mail: String,
    login:  { type: String, index: { unique: true } },
    firstname: String,
    lastname: String,
    //login: { type: String, required: true, index: { unique: true } },
    //firstname: { type: String, required: true },
    password: String,
    apiKey: String,
    issue_ids: [],
    currentIssue: {
      id: { type: String, default: null },
      startedAt: { type: Date, default: 0 },
      paused: { type: Boolean, default: false },
      pendingDuration: { type: Number, default: 0 },
      //issueId: String,
      //issueName: String,
      issueStatus: String,
      issueTime: Number,
      //issueUrl: String
    }
});

/*
 *Users.virtual('login').get(function(){
 *  return this.login;
 *});
 */

Users.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return storeApiKey(user, next);

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            storeApiKey(user, next);
        });
    });
});

var storeApiKey = function(user, next) {
  if (!user.isModified('apiKey')) return next();

  var cipher = crypto.createCipher(algorithm, key);
  user.apiKey = cipher.update(user.apiKey, 'utf8', 'hex') + cipher.final('hex');
  next();
};

Users.methods.getApiKey = function() {
  var decipher = crypto.createDecipher(algorithm, key);
  return decipher.update(this.apiKey, 'hex', 'utf8') + decipher.final('utf8');
};

Users.methods.comparePassword = function(candidatePassword, callback) {
  console.log("candidatePassword : ", candidatePassword);
  console.log("this.password : ", this.password);
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};

Users.methods.startIssue = function( issue, callback ){
  console.log("Users startIssue : ", issue.id);
  if (this.currentIssue.id) {
    this.stopIssue( callback );
  }

  //this.currentIssue.issueId = issue.id.toString();
  //this.currentIssue.issueName = issue.subject;
  this.currentIssue.issueStatus = "en cours";
  this.currentIssue.issueTime = "0";
  //this.currentIssue.issueUrl = issue.url;
  // this.currentIssue.login = login;
  this.currentIssue.id = issue.id.toString();
  this.currentIssue.paused = false;
  this.currentIssue.startedAt = new Date();
  this.save();
  callback( null, this.currentIssue );
};

Users.methods.pauseIssue = function( callback ){
  if (this.currentIssue.paused) {
    this.currentIssue.paused = false;
    this.currentIssue.startedAt = new Date();
    this.currentIssue.issueStatus = "en cours";
  }
  else {
    this.currentIssue.paused = true;
    this.currentIssue.pendingDuration = this.currentIssue.pendingDuration + (new Date() - this.currentIssue.startedAt);
    this.currentIssue.issueStatus = "en pause";
  }
  this.save();
  callback( null, this.currentIssue );
};

Users.methods.stopIssue = function( callback ){
  //var totalDuration = this.currentIssue.pendingDuration + new Date() - this.currentIssue.startedAt;
  console.log("this.currentIssue : ", this.currentIssue);
  if (this.currentIssue.id) {
      if (!this.currentIssue.paused) {
        this.currentIssue.pendingDuration = this.currentIssue.pendingDuration + (new Date() - this.currentIssue.startedAt);
      }
      this.save();
      callback( null, this.currentIssue );

      // this.currentIssue = {};
      //this.currentIssue.issueId = null;
      //this.currentIssue.issueName = null;
      this.currentIssue.issueStatus = null;
      this.currentIssue.issueTime = null;
      //this.currentIssue.issueUrl = null;
      this.currentIssue.id = null;
      this.currentIssue.paused = false;
      this.currentIssue.startedAt = 0;
      this.currentIssue.pendingDuration = 0;
      this.save();
  }
  else {

      callback( null, this.currentIssue );
  }
};

/*
 *var Users = new Schema({
 *    id: { type: Number, index: true },
 *    //type_id: String,
 *    last_login_on: String,
 *    created_on: String,
 *    mail: String,
 *    login: String,
 *    firstname: String,
 *    lastname: String
 *});
 */

var Projects = new Schema({
    id: { type: Number, index: true },
    //type_id: String,
    created_on: String,
    description: String,
    updated_on: String,
    identifier: String,
    name: String
});

/*
 *var TeamMembers = new Schema({
 *    id: { type: Number, index: true },
 *    //type_id: String,
 *    login: {
 *        type: String,
 *        index: {
 *            unique: true
 *        }
 *    },
 *    name: String,
 *    password: String,
 *    issuesCount: Number,
 *    issue_ids: [],
 *    current: { type: String, default: 'Aucune' },
 *    redmine: {
 *        login: String,
 *        firstname: String,
 *        lastname: String,
 *        apikey: String,
 *        issuesCount: Number,
 *        issues: {}
 *    }
 *});
 */

var Detail = new Schema({
    issueId: { type: Number, index: true },
    created_on: Date,
    name: String,
    property: String,
    old_value: String,
    new_value: String
});

var Journal = new Schema({
    id: { type: Number, index: true },
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
    id: { type: Number, index: true },
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

var Priorities = new Schema({
    id: { type: Number, unique: true, index: true },
    name: String
});

var Priority = mongoose.model('Priority', Priorities);

var Issues = new Schema({
    id: { type: Number, default: 0, index: true },
    user_id: Number,
    url: String,
    //type_id: String,
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
    project_id: Number,
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
    //priority: {type: Number, ref: 'Priority'},
    priority: {
        name: String,
        id: Number
    },
    priority_id: Number,
    journals: [Journal],
    time_entries: [TimeEntry],
    time_entriesTotal: { type: Number, default: 0 },
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

Issues.pre('save', function(next) {
    this.url = 'https://' + config.redmine.host + '/issues/show/' + this.id;
    this.project_id = this.project.id;
    this.priority_id = this.priority.id;

    var issue = this;
    //console.log("this.priority.id : ", issue.priority.id);
    Priority.findOne({id: issue.priority.id}, function(err, priority){
      //console.log("err : ", err);
      //console.log("priority : ", priority);
      if (!priority) {
        //console.log("priority : ", priority);
        //console.log("issue.priority : ", issue.priority);
        var priority = new Priority ( {id: issue.priority.id, name: issue.priority.name} );
        priority.save();
      }
    });
    next();
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

Issues.methods.getFirstJournal = function getFirstJournal (callback) {
    this.model('Journal').find({'issue.id': this.id}).sort('id', -1).exec(callback);
};

Issues.methods.buildStats = function buildStats (callback) {
    console.log("buildStat : ");
    //console.log("this : ", this.find());
    //return this.model('IssueStats').find({ type: this.type }, callback);
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

Issues.statics.buildStats = function buildStats (callback) {
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
mongoose.model('Project', Projects);
//mongoose.model('Priority', Priorities);
//mongoose.model('TeamMember', TeamMembers);
