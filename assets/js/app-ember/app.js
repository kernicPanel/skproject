var RealTeam = Ember.Application.create({
/*
 *  ready: function() {
 *    var socket = RealTeam.socket = io.connect();
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
 *          //var user = RealTeam.User.createRecord(users[i]);
 *        //}
 *      //});
 *    });
 *  }
 */
});

RealTeam.Router.map(function(){
  this.resource('users', function() {
    //this.resource('user', {path:':user_id'});
    this.resource('user', {path:':user_id'}, function(){
      this.resource('issues', function(){
        console.log('nrstnrst');
      });
    });
  });
});

RealTeam.ApplicationRoute = Ember.Route.extend({
  setupController: function () {
    //this.controllerFor('food').set('model', RealTeam.Food.find());
  },
  init: function () {
    console.log('ApplicationRoute init');
  }
});

RealTeam.IndexRoute = Ember.Route.extend({
  redirect: function () {
    this.transitionTo('users');
  }
});

RealTeam.UsersRoute = Ember.Route.extend({
  model: function() {
    return RealTeam.User.find();
  }
});

 //Auto generated
RealTeam.UserRoute = Ember.Route.extend({
  init: function () {
    console.log('UserRoute init');
  },
  model: function(params) {
    console.log('UserRoute model', params);
    //return RealTeam.Issue.find(params.user_id);
  }
});

// Auto generated
RealTeam.UsersController = Ember.ArrayController.extend({
  sortProperties: ['id'],
  init: function(){
    console.log('init UserController');
  }
});

// Auto generated
//RealTeam.UserController = Ember.ObjectController.extend();

/*
 *RealTeam.FoodController = Ember.ArrayController.extend({
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
//RealTeam.TabController = Ember.ObjectController.extend();

// view helpers
Ember.Handlebars.registerBoundHelper('money', function (value) {
  return (value % 100 === 0 ?
          value / 100 + '.00' :
          parseInt(value / 100, 10) + '.' + value % 100);
});

// Models
RealTeam.Store = DS.Store.extend({
  revision: 11,
  //adapter: 'DS.FixtureAdapter'
  //adapter: 'RealTeam.SocketAdapter'
  adapter: 'DS.RESTAdapter'
});

RealTeam.User = DS.Model.extend({
  name: DS.attr('string'),
  //id: DS.attr('number'),
  //issues: DS.hasMany('RealTeam.Issues')
  //tab: DS.belongsTo('RealTeam.Tab')
});

RealTeam.SocketAdapter = DS.Adapter.extend({

});

/*
 *RealTeam.Tab = DS.Model.extend({
 *  tabItems: DS.hasMany('RealTeam.TabItem'),
 *  cents: function () {
 *    return this.get('tabItems').getEach('cents').reduce(function(accum, item){
 *      return accum + item;
 *    }, 0);
 *  }.property('tabItems.@each.cents')
 *});
 *
 *RealTeam.TabItem = DS.Model.extend({
 *  cents: DS.attr('number'),
 *  food: DS.belongsTo('RealTeam.Food')
 *});
 *
 *RealTeam.Food = DS.Model.extend({
 *  name: DS.attr('string'),
 *  imageUrl: DS.attr('string'),
 *  cents: DS.attr('number')
 *});
 */

RealTeam.User.FIXTURES = [];
/*
 *RealTeam.User.FIXTURES = [{
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
 *RealTeam.Tab.FIXTURES = [{
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
 *RealTeam.TabItem.FIXTURES = [{
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
 *RealTeam.Food.FIXTURES = [{
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
