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
    user: {
        name: String,
        id: Number
    },
    notes: String,
    created_on: String,
    details: [Detail]
});

var IssuesExtract = new Schema({
    id: { type: Number, default: 0 },
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
    },
    journals: [Journal],
    time_entries: {}
});

mongoose.model('User', Users);
mongoose.model('Issue', Issues);
mongoose.model('Detail', Detail);
mongoose.model('Journal', Journal);
mongoose.model('IssueExtract', IssuesExtract);
mongoose.model('Project', Projects);
mongoose.model('SkUser', SkUsers);
mongoose.model('SkProjects', SkProjects);
mongoose.model('SkIssues', SkIssues);
