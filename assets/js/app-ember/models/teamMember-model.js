
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
    //$.ajax({
      //url: '/currentuser',
      //dataType: 'jsonp',
      //context: this,
      //complete: function(data){
        //data.data.forEach(function(contributor){
          //this.allContributors.addObject(App.Contributor.create(contributor))
        //}, this)
        console.log('Currentuser this', this);
        console.log('Currentuser find', data);
        //this.set('username', data.currentuser.username);
        return RealTeam.set('currentuser', RealTeam.Currentuser.create(data.currentuser));
    });
    //return this.allContributors;
  }
});

RealTeam.TeamMember = DS.Model.extend({
  name: DS.attr('string'),
  issues: DS.hasMany('RealTeam.Issue'),
  current: DS.attr('string')
});

RealTeam.TeamMember.FIXTURES = [{
  id: 1,
  name: 'teamMember 1',
  issue_ids: [1, 2, 5],
  current: 'none'
},{
  id: 2,
  name: 'teamMember 2',
  issue_ids: [3, 4],
  current: 'nooone'
}];

RealTeam.Issue = DS.Model.extend({
  teamMember: DS.belongsTo('RealTeam.TeamMember'),
  subject: DS.attr('string'),
  url: DS.attr('string')
});

RealTeam.Issue.FIXTURES = [{
  id: 1,
  subject: 'issue 1',
  url: 'nrsauti narsutin',
  teamMember: 1
},{
  id: 2,
  subject: 'issue 2',
  url: 'rastmnsratmrstaust',
  teamMember: 1
},{
  id: 3,
  subject: 'issue 3',
  url: 'rastmnsratmrstaust narsut anursit',
  teamMember: 2
},{
  id: 4,
  subject: 'issue 4',
  url: 'mnrsaumauiauiu rastmnsratmrstaust',
  teamMember: 2
},{
  id: 5,
  subject: 'issue 5',
  url: 'rastmnsratmrstaust',
  teamMember: 1
}];
