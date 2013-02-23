var App = Ember.Application.create({
/*
 *  ready: function() {
 *    var socket = App.socket = io.connect();
 *
 *    socket.on('realTeam::connect', function(data){
 *      console.log('realTeam::connect');
 *      //noty({text: 'Socket Connected', timeout:3000});
 *
 *      //socket.emit('getUsers', {}, function (err, users) {
 *        //console.log(users); // users will be 'woot'
 *        //var loopCount = users.length;
 *        //for (var i = 0; i < loopCount; i++) {
 *          ////console.log("getUsers users : ", users[i]);
 *          ////console.log("getUsers redmine : ", users[i].redmine);
 *          //var user = App.User.createRecord(users[i]);
 *        //}
 *      //});
 *    });
 *  }
 */
});

App.Router.map(function(){
  this.resource('users', function() {
    this.resource('user', {path:':user_id'});
  });
});

App.ApplicationRoute = Ember.Route.extend({
  setupController: function () {
    //this.controllerFor('food').set('model', App.Food.find());
  },
  init: function () {
    console.log('ApplicationRoute init');
  }
});

App.IndexRoute = Ember.Route.extend({
  redirect: function () {
    this.transitionTo('users');
  }
});

App.UsersRoute = Ember.Route.extend({
  model: function() {
    return App.User.find();
  }
});

 //Auto generated
App.UserRoute = Ember.Route.extend({
  init: function () {
    console.log('UserRoute init');
  }
  /*
   *model: function(params) {
   *  return App.User.find(params.user_id);
   *}
   */
});

// Auto generated
App.UsersController = Ember.ArrayController.extend({
  sortProperties: ['id'],
  init: function(){
    console.log('init UserController');
  }
});

// Auto generated
//App.UserController = Ember.ObjectController.extend();

/*
 *App.FoodController = Ember.ArrayController.extend({
 *  //needs: ['users'],
 *  sortProperties: ['name'],
 *  addFood: function (food) {
 *    //test = this.get('controllers.users.model');
 *    //test = this;
 *
 *    var user = this.controllerFor('user').get('model'),
 *    //var user = this.get('user').get('model'),
 *        tabItems = user.get('tab.tabItems');
 *
 *    //debugger;
 *    tabItems.createRecord({
 *      food: food,
 *      cents: food.get('cents')
 *    });
 *  }
 *});
 */

// Auto generated
//App.TabController = Ember.ObjectController.extend();

// view helpers
Ember.Handlebars.registerBoundHelper('money', function (value) {
  return (value % 100 === 0 ?
          value / 100 + '.00' :
          parseInt(value / 100, 10) + '.' + value % 100);
});

// Models
App.Store = DS.Store.extend({
  revision: 11,
  //adapter: 'DS.FixtureAdapter'
  //adapter: 'App.SocketAdapter'
  adapter: 'DS.RESTAdapter'
});

App.User = DS.Model.extend({
  name: DS.attr('string'),
  //id: DS.attr('number'),
  //issues: DS.hasMany('App.Issues')
  //tab: DS.belongsTo('App.Tab')
});

App.SocketAdapter = DS.Adapter.extend({

});

/*
 *App.Tab = DS.Model.extend({
 *  tabItems: DS.hasMany('App.TabItem'),
 *  cents: function () {
 *    return this.get('tabItems').getEach('cents').reduce(function(accum, item){
 *      return accum + item;
 *    }, 0);
 *  }.property('tabItems.@each.cents')
 *});
 *
 *App.TabItem = DS.Model.extend({
 *  cents: DS.attr('number'),
 *  food: DS.belongsTo('App.Food')
 *});
 *
 *App.Food = DS.Model.extend({
 *  name: DS.attr('string'),
 *  imageUrl: DS.attr('string'),
 *  cents: DS.attr('number')
 *});
 */

App.User.FIXTURES = [];
/*
 *App.User.FIXTURES = [{
 *  id: 1,
 *  tab: 1
 *}, {
 *  id: 2,
 *  tab: 2
 *}, {
 *  id: 3,
 *  tab: 3
 *}, {
 *  id: 4,
 *  tab: 4
 *}, {
 *  id: 5,
 *  tab: 5
 *}, {
 *  id: 6,
 *  tab: 6
 *}];
 */

/*
 *App.Tab.FIXTURES = [{
 *  id: 1,
 *  tabItems: []
 *}, {
 *  id: 2,
 *  tabItems: []
 *}, {
 *  id: 3,
 *  tabItems: []
 *}, {
 *  id: 4,
 *  tabItems: [400, 401, 402, 403, 404]
 *}, {
 *  id: 5,
 *  tabItems: []
 *}, {
 *  id: 6,
 *  tabItems: []
 *}];
 */

/*
 *App.TabItem.FIXTURES = [{
 *  id: 400,
 *  cents: 1500,
 *  food: 1
 *}, {
 *  id: 401,
 *  cents: 300,
 *  food: 2
 *}, {
 *  id: 402,
 *  cents: 700,
 *  food: 3
 *}, {
 *  id: 403,
 *  cents: 950,
 *  food: 4
 *}, {
 *  id: 404,
 *  cents: 2000,
 *  food: 5
 *}];
 */

/*
 *App.Food.FIXTURES = [{
 *  id: 1,
 *  name: 'Pizza',
 *  imageUrl: 'img/pizza.png',
 *  cents: 1500
 *}, {
 *  id: 2,
 *  name: 'Pancakes',
 *  imageUrl: 'img/pancakes.png',
 *  cents: 300
 *}, {
 *  id: 3,
 *  name: 'Fries',
 *  imageUrl: 'img/fries.png',
 *  cents: 700
 *}, {
 *  id: 4,
 *  name: 'Hot Dog',
 *  imageUrl: 'img/hotdog.png',
 *  cents: 950
 *}, {
 *  id: 5,
 *  name: 'Birthday Cake',
 *  imageUrl: 'img/birthdaycake.png',
 *  cents: 2000
 *}];
 */
