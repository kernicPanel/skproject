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

var config = {
  mongo: {
    host: process.env.MONGO_HOST || 'mongodb://localhost/realteam'
  },
  redmine: {
    host: process.env.REDMINE_HOST || 'demo.redmine.org',
    apiKey: process.env.REDMINE_APIKEY || '0682bccad9ac01e9c39680080405ffa1aab75f77',

    //used to filter redmine users to create team
    mailFilter: ''
  },
  server: {
    //ip needed
    host: 'localhost',
    port: 8081,
    name: 'realTeam',

    //fill array with user login to add admin role
    admin: [
      ''
    ]
  },
  crypto: {
    algorithm: 'aes256',
    key: 'cryptoKey'
  },

  //communication with redmine bot
  irc: {
    server: 'irc.freenode.net',

    //channel where redmine bot can be found
    channel: '#channel',

    //realteam bot name
    botName: 'myBot',

    //passPhrase to send to redmine bot for auth
    passPhrase: 'passPhrase',

    //redmine bot name
    redmineBot: 'redmineBot',
  },

  //frontend fframe work used
  //clientFramework: 'ember',
  //clientFramework: 'backbone',
  clientFramework: 'angular',
  extract: {

    //user names to filter stats
    team: [
      'Team Member1',
      'Team Member2'
    ],

    //non worked days (used by stats)
    holiday: {
      fixes: ['1 1', '1 5', '8 5', '14 7', '11 11', '15 8', '1 11', '25 12'],
      paques: ['13 4 09', '5 4 10', '25 4 11', '9 4 12', '1 4 13'],
      ascension: ['22 05 09', '14 05 10', '03 06 11', '18 05 12', '10 05 13'],
      pentecote: ['11 07 09', '03 07 10', '23 07 11', '07 07 12', '29 06 13']
    }
  }
};

module.exports = config;
