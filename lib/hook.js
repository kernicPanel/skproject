
var WebserverHook = require('hook.io-webserver').Webserver,
    http = require('http'),
    util = require('util');

var Core = exports.Core = function(options){
  WebserverHook.call(this, options);
};

// Core inherits from WebserverHook
util.inherits(Core, WebserverHook);
