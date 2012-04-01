console.log("»»»»»test load««««««");
var test ={};
/* or
 * , var = require('toto');
 */
var Hook = require('hook.io').Hook;
test.init = function() {
    var hook = new Hook();
    hook.start();

};

test.start = function(callback) {
    callback = callback || function(){};
    callback();
};

test.stop = function(callback) {
    callback = callback || function(){};
    callback();
};

module.exports = test;
