var config = {};

config.mongo = {};
config.redmine = {};
config.server = {};

config.mongo.host = process.env.MONGO_HOST || 'mongodb://localhost/test';
config.redmine.host = process.env.REDMINE_HOST || 'demo.redmine.org';
config.redmine.apiKey = process.env.REDMINE_APIKEY || '0682bccad9ac01e9c39680080405ffa1aab75f77';
config.server.host = 'localhost';
config.server.port = 8081;
config.irc.server = 'irc.azerty.net';
config.irc.channel = '#salon';
config.irc.botName = 'monBot';
config.irc.passPhrase = 'passPhrase';


module.exports = config;
