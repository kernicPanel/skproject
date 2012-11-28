/*

Copyright (c) 2012 Nicolas Clerc <kernicpanel@nclerc.fr>

This file is part of redLive.

redLive is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

redLive is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with redLive.  If not, see <http://www.gnu.org/licenses/>.

*/

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

mongoose.model('User', Users);
mongoose.model('Issue', Issues);
mongoose.model('Project', Projects);
mongoose.model('SkUser', SkUsers);
mongoose.model('SkProjects', SkProjects);
mongoose.model('SkIssues', SkIssues);
