
// Requires Ember-Data

/*
 *RealTeam.Currentuser = DS.Model.extend({
 *  name: DS.attr('string'),
 *  issues: DS.hasMany('RealTeam.Issue'),
 *  current: DS.attr('string'),
 *
 *  apiKey: DS.attr('string'),
 *  created_on: DS.attr('string'),
 *  currentTask: DS.attr('string'),
 *  firstname: DS.attr('string'),
 *  last_login_on: DS.attr('string'),
 *  lastname: DS.attr('string'),
 *  mail: DS.attr('string'),
 *  password: DS.attr('string'),
 *  username: DS.attr('string'),
 *});
 *RealTeam.Currentuser.sync = {
 *  find: function(id, process) {
 *    jQuery.getJSON("/people/" + id).then(function(json) {
 *      process(json).camelizeKeys().load();
 *    });
 *  }
 *};
 */
RealTeam.Currentuser = Ember.Object.extend();
RealTeam.Currentuser.reopenClass({
  username: 'initial username',
  find: function(){
    console.log('Currentuser find start');
    $.getJSON('/currentuser', function(data) {
        return RealTeam.set('currentuser', RealTeam.Currentuser.create(data.currentuser));
    });
  }
});

RealTeam.User = DS.Model.extend({
  firstname: DS.attr('string'),
  lastname: DS.attr('string'),
  name: function() {
    return this.get('firstname') + ' ' + this.get('lastname');
  }.property('firstname', 'lastname'),
  issues: DS.hasMany('RealTeam.Issue'),
  current: DS.attr('string')
});

RealTeam.User.FIXTURES = [{
  id: 1,
  name: 'user 1',
  issue_ids: [1, 2, 5],
  current: 'none'
},{
  id: 2,
  name: 'user 2',
  issue_ids: [3, 4],
  current: 'nooone'
}];

RealTeam.Issue = DS.Model.extend({
  user: DS.belongsTo('RealTeam.User'),
  subject: DS.attr('string'),
  url: DS.attr('string')
});

RealTeam.Issue.FIXTURES = [{
  id: 1,
  subject: 'issue 1',
  url: 'nrsauti narsutin',
  user: 1
},{
  id: 2,
  subject: 'issue 2',
  url: 'rastmnsratmrstaust',
  user: 1
},{
  id: 3,
  subject: 'issue 3',
  url: 'rastmnsratmrstaust narsut anursit',
  user: 2
},{
  id: 4,
  subject: 'issue 4',
  url: 'mnrsaumauiauiu rastmnsratmrstaust',
  user: 2
},{
  id: 5,
  subject: 'issue 5',
  url: 'rastmnsratmrstaust',
  user: 1
}];
