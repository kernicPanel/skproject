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
