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

var path = require('path'),
    util = require('util'),
    should = require('should'),
    mongoose = require('mongoose');

var basedir = path.join(__dirname, '..');
var libdir = path.join(basedir, 'lib');
var modelsdir = path.join(basedir, 'models');

var issues = require(path.join(modelsdir, 'issues.js'));
var config = require(path.join(libdir, 'config.js'));

mongoose.connect('mongodb://localhost/redmine_test');
var issueTest = {
    id: 1,
    type_id: 'type test',
    created_on: 'created_on test',
    start_date: 'start_date test',
    description: 'description test',
    status: { name: 'status name test', id: 111 },
    done_ratio: 100,
    project: { name: 'project name test', id: 222 },
    author: { name: 'author name test', id: 333 },
    updated_on: 'updated_on test',
    due_date: 'due_date test',
    tracker: { name: 'tracker name test', id: 444 },
    subject: 'subject test',
    assigned_to: { name: 'assigned_to name test', id: 555 },
    priority: { name: 'priority name test', id: 666 }
};

describe('issues', function(){
    var currentCustomer = null;

    beforeEach(function(done){
        //add some test data
        issues.store(issueTest, function(doc){
            currentCustomer = doc;
            doc.description.should.eql(issueTest.description);
            doc.id.should.eql(issueTest.id);
            done();
        });
    });

    afterEach(function(done){
        //issues.model.remove(issueTest, function() {
        issues.model.remove({}, function() {
            done();
        });
    });
    it('should retrieve by id', function() {
        issues.findById(issueTest.id,
            function(doc) {
                should.exist(doc);
                doc.description.should.eql(issueTest.description);
                doc.id.should.eql(issueTest.id);
            },
            function(error) {

            });
    });
    it('should retrieve all issues', function() {
        issues.getAll(
            function(docs) {
                should.exist(docs);
                docs[0].description.should.eql(issueTest.description);
                docs[0].id.should.eql(issueTest.id);
            },
            function(error) {
            });
    });
    it('should return null on retrieve by unknown id', function() {
        issues.findById(9879,
            function(doc) {
                should.not.exist(doc);
            },
            function(error) {
            });
    });
});
