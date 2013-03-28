RealTeam.Currentuser = Ember.Object.extend();
RealTeam.Currentuser.reopenClass({
  username: 'initial username',
  hasAddtime: false,
  find: function(){
    console.log('Currentuser find start');
    $.getJSON('/currentuser', function(res) {
        return RealTeam.set('currentuser', RealTeam.Currentuser.create(res.currentuser));
    });
  }
});
