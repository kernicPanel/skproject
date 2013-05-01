/*
 *RealTeam.ProjectController = Ember.ObjectController.extend({
 *  init: function(){
 *    console.log('init ProjectController');
 *  },
 *  firstLevel: function (project) {
 *    console.log('this', this);
 *    return true;
 *    //return !this.get('parent');
 *  }.property('model.parent@each.id')
 *});
 */

RealTeam.ProjectsController = Ember.ArrayController.extend({
  init: function(){
    console.log('init ProjectsController');
  },
  //sortProperties: ['id'],
  //sortAscending: false,
  rootProjects: function(){
    var filteredProjects = this.filter(function(project) {
      console.log('project.get(parent)', project.get('parent'));
      return project.get('parent') === null;
    });
    return filteredProjects;
  }.property('@each.parent')
});

//RealTeam.projectController = RealTeam.ProjectController.create();


/*
 *RealTeam.ProjectMenuController = Ember.ArrayController.extend({
 *  init: function(){
 *    console.log('init ProjectMenuController');
 *  },
 *  setupController: function(){
 *    console.log('setupController ProjectMenuController');
 *  },
 *  firstLevel: function (project) {
 *    console.log('this', this);
 *    return true;
 *    //return !this.get('parent');
 *  }.property('model.parent@each.id')
 *});
 */
