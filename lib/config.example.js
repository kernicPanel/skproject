var config = {};

config.mongo = {};
config.redmine = {};
config.server = {};
config.crypto = {};
config.irc = {};
config.extract = {};

config.mongo.host = process.env.MONGO_HOST || 'mongodb://localhost/test';
config.mongo.session = process.env.MONGO_HOST || 'mongodb://localhost/session';
config.redmine.host = process.env.REDMINE_HOST || 'demo.redmine.org';
config.redmine.apiKey = process.env.REDMINE_APIKEY || '0682bccad9ac01e9c39680080405ffa1aab75f77';
config.redmine.mailFilter = '';
config.server.host = 'localhost';
config.server.port = 8081;
config.server.name = 'redLive';
config.server.admin = [];
config.crypto.algorithm = 'aes256';
config.crypto.key = 'cryptoKey';
config.irc.server = 'irc.freenode.net';
config.irc.channel = '#salon';
config.irc.botName = 'monBot';
config.irc.passPhrase = 'passPhrase';
config.irc.redmineBot = 'kernicPanel';
//config.clientFramework = 'ember';
// config.clientFramework = 'backbone';
config.clientFramework = 'angular';

config.extract.projectName = 'Stats Project';
config.extract.projectIdentifier = 'statPrj';
config.extract.subprojects = ['Stats SubProject1', 'Stats SubProject2'];
config.extract.team = ['Team Member1', 'Team Member2'];
config.extract.holiday = {};
config.extract.holiday.fixes = ['1 1', '1 5', '8 5', '14 7', '11 11', '15 8', '1 11', '25 12'];
config.extract.holiday.paques = ['13 4 09', '5 4 10', '25 4 11', '9 4 12', '1 4 13'];
config.extract.holiday.ascension = ['22 05 09', '14 05 10', '03 06 11', '18 05 12', '10 05 13'];
config.extract.holiday.pentecote = ['11 07 09', '03 07 10', '23 07 11', '07 07 12', '29 06 13'];


module.exports = config;
