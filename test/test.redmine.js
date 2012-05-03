var path = require('path'),
    util = require('util'),
    should = require('should'),
    mongoose = require('mongoose');

var basedir = path.join(__dirname, '..');
var libdir = path.join(basedir, 'lib');

var redmine = require(path.join(libdir, 'redmine.js')),
    config = require(path.join(libdir, 'config.js')),
    Redmine = require(path.join(libdir, 'redmine-rest.js'));


describe('redmine', function(){

    describe('redmine', function(){
        it('should be an object', function() {
            redmine.should.be.a('object');
        });
    });

    describe('redmine.init', function(){
        it('should be a function', function() {
            redmine.init.should.be.a('function');
        });
    });

    describe('redmine.sync', function(){
        it('should be a function', function() {
            redmine.sync.should.be.a('function');
        });
    });

});
