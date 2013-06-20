Ember.Handlebars.registerBoundHelper('timer', function(date, pendingDuration) {
/*
 *  if (!!date) {
 *    var timer =  '<span id="timer">' + moment(date).subtract('ms', pendingDuration).fromNow() + '</span>';
 *    //var timer =  moment(date).add('ms', pendingDuration).format('dddd, MMMM Do YYYY, hh:mm:ss').fromNow();
 *
 *    function date_time() {
 *      time = moment(date).subtract('ms', pendingDuration).fromNow();
 *      $('#timer').html(time);
 *    }
 *    RealTeam.set('currentIntervalId', setInterval(function () { date_time(); }, 60000));
 *
 *    return new Ember.Handlebars.SafeString(timer);
 *  }
 *  else {
 *    return '';
 *  }
 */

//var timer = moment().seconds(date);

//var timer =  moment(date).subtract('ms', pendingDuration).fromNow();

if (!date) {
  return ;
}
//console.log("date : ", date);
//date = moment(new Date(date));
//date = moment(date).local();
date = moment(date);
//console.log("date : ", date);
//console.log("pendingDuration : ", pendingDuration);
//var duration = moment.duration(date, 'milliseconds');
//var timer = moment(duration.asMilliseconds());
//console.log("date.zone() : ", date.zone());
var formatedTimer = date.format('H:mm:ss');

//var timer = moment.duration(date, 'seconds');
//console.log("timer : ", timer);
//realteam.currentuser.set('currenttimer', timer);
//RealTeam.currentuserController.runTimer();
return formatedTimer;
//return date;
//return timer.format("dddd, MMMM Do YYYY, h:mm:ss a");

//return moment.duration(date).humanize();
});
