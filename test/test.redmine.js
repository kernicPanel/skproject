/*

Copyright (c) 2012 Nicolas Clerc <kernicpanel@nclerc.fr>

This file is part of realTeam.

realTeam is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

realTeam is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with realTeam.  If not, see <http://www.gnu.org/licenses/>.

*/

var path = require('path'),
    util = require('util'),
    colors = require('colors'),
    should = require('chai').should,
    mongoose = require('mongoose');

 mongoose.models = {};
 mongoose.modelSchemas = {};

colors.setTheme({
    silly: 'rainbow',
    input: 'black',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

var basedir = path.join(__dirname, '..');
var libdir = path.join(basedir, 'lib');

var redmine = require(path.join(libdir, 'redmine.js')),
    config = require(path.join(libdir, 'config.js'));
    //Redmine = require(path.join(libdir, 'redmine-rest.js'));

describe('redmine', function(){

  after(function(done){
    mongoose.disconnect(function () {
      console.log('mongoose disconnected');
      done();
    });
  });

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

  describe('fake test redmine.truc', function(){
    it('should callback true', function() {
      redmine.truc(function(result){
        result.should.be.true;
      });
    });
  });

  describe('redmine.fetchRedmineUsers', function(){
    it('should fetch redmine users', function() {
      redmine.fetchRedmineUsers(function(err, users){
        console.log('users', users);
        err.should.be.a('null');
        users.should.not.be.a('null');
      });
    });
  });

  /*
   *describe('redmineRest', function(){
   *    it('should be a function', function() {
   *        redmineRest.should.be.a('function');
   *    });
   *});
   */

});
