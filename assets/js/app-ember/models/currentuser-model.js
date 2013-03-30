RealTeam.Currentuser = Ember.Object.extend();
RealTeam.Currentuser.reopenClass({
  login: 'initial login',
  hasAddtime: false,
  find: function(){
    console.log('Currentuser find start');
    $.getJSON('/currentuser', function(res) {
        return RealTeam.set('currentuser', RealTeam.Currentuser.create(res.currentuser));
    });
  }
});
