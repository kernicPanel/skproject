var app = {
  // Classes
  Collections: {},
  Models: {},
  Views: {},
  // Instances
  collections: {},
  views: {},
  //Events
  //socket: {},
  init: function (personnages) {
    // Initialisation de la collection Personnages
    //this.collections.personnages = new this.Collections.personnages(personnages);
    // Initialisation du router, c'est lui qui va instancier notre vue
    //this.router = new app.Router();
    // On précise à Backbone JS de commencer à écouter les changement de l'url afin d’appeler notre routeur
    //Backbone.history.start();

/*
 *    var eventsManager = this.eventsManager = {};
 *        eventsManager.socket = io.connect();
 *
 *    // Mixin
 *    _.extend(eventsManager, Backbone.Events);
 *
 *    // Add a custom event
 *    eventsManager.on("startEvent", function(issueId, callback){
 *      console.log("We triggered " + issueId);
 *      eventsManager.socket.emit('redmine::startIssue', issueId, function (err, data) {
 *        console.log("start : ", data);
 *        callback(err, data);
 *      });
 *    });
 */

    this.views.skuserView = new this.Views.TeamMemberView();
    this.collections.issueList = new this.Collections.IssueList();

    this.views.skprojectView = new this.Views.SkProjectView();

    var resetIsotope = function() {
      console.log("srrstr : ");
      $('#content').isotope();
    };
    window.onresize = resetIsotope;

    //
    //Events
    //
/*
 *    $('#sync').click(function() {
 *        eventsManager.socket.emit('redmine::sync', function (data) {
 *          console.log(data);
 *        });
 *    });
 *
 *    $('#setusers').click(function() {
 *        eventsManager.socket.emit('setUsersIssues', function (err, data) {
 *          console.log('setUsers click', data);
 *        });
 *    });
 *
 *    $('#getusers').click(function() {
 *        //skuserView.remove();
 *        eventsManager.socket.emit('getUsers', function (data) {
 *          console.log(data);
 *        });
 *    });
 *
 *    $('#setprojects').click(function() {
 *        console.log("setprojects : ");
 *        eventsManager.socket.emit('setSkProjects', function (data) {
 *          console.log(data);
 *        });
 *    });
 *
 *    $('#getprojects').click(function() {
 *        //skuserView.remove();
 *        eventsManager.socket.emit('getSkProjects', function (data) {
 *          console.log(data);
 *        });
 *    });
 *
 *
 *    eventsManager.socket.on('redmine::connect', function(data){
 *        console.log("redmine connect : ");
 *        eventsManager.socket.emit('getUsers', function (err, data) {
 *            //console.log(err, data);
 *            app.views.skuserView.addUsers(data);
 *        });
 *
 *        eventsManager.socket.emit('getIssues', function (err, data) {
 *            //console.log(err, data);
 *            app.collections.issueList.addIssues(data);
 *        });
 *
 *        eventsManager.socket.on('updateCurrentIssue::response', function(data){
 *            //console.log(data.login, " updateCurrentIssueThux data : ", data);
 *            app.views.skuserView.updateCurrentIssueThux(data);
 *        });
 *
 *        eventsManager.socket.on('getSkProjects::response', function(data){
 *            //console.log("data : ", data);
 *            app.views.skprojectView.addProjects(data);
 *        });
 *
 *        eventsManager.socket.on('updateIssue', function (issue) {
 *            console.log('updateIssue : ', issue);
 *            //app.collections.issueList.updateIssue(issue);
 *            app.views.skuserView.updateIssue(issue);
 *        });
 *
 *        eventsManager.socket.on('createIssue', function (data) {
 *            console.log('createIssue : ', data);
 *        });
 *
 *        eventsManager.socket.on('log', function(data){
 *            console.log("data : ", data);
 *        });
 *
 *    });
 */
  }
};


$(function() {
    app.init();
});

var updateIssue = function() {
    eventsManager.socket.emit('syncIssues');
};
