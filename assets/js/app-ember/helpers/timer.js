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
console.log("date : ", date);
console.log("pendingDuration : ", pendingDuration);
var duration = moment.duration(date * 1000, 'milliseconds');
var timer = moment(duration.asMilliseconds()).add(pendingDuration).format('d hh:mm:ss');

//var timer = moment.duration(date, 'seconds');
console.log("timer : ", timer);
return timer;
//return timer.format("dddd, MMMM Do YYYY, h:mm:ss a");

});
