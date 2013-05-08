RealTeam.ProjectController = Ember.ObjectController.extend({
  init: function(){
    console.log('init ProjectController');
  }
});

RealTeam.ProjectsController = Ember.ArrayController.extend({
  init: function(){
    console.log('init ProjectsController');
  },
  showChildren: function(id) {
    var currentProject = RealTeam.Project.find(id);
    currentProject.set('isExpanded', !currentProject.get('isExpanded'));
  },
  rootProjects: function(){
    var filteredProjects = this.filter(function(project) {
      //console.log('project.get(parent)', project.get('parent'));
      return project.get('parent') === null;
    });
    return filteredProjects;
  }.property('@each.parent')
});

RealTeam.GraphView = Ember.View.extend({
  templateName: "graph",
  didInsertElement: function () {
    $.getJSON( '/statsProject/' + this.id)
    .done(function( stats ) {

      $('#chartContainer').highcharts({
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false
        },
        title: {
          text: 'Statuses'
        },
        tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage}%</b>',
          percentageDecimals: 1
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              color: '#000000',
              connectorColor: '#000000',
              formatter: function() {
                //console.log('formatter', this);
                return '<b>'+ this.point.name +'</b> : ' + this.y + ' ('+ this.percentage +'%)';
              }
            }
          }
        },
        series: [{
          type: 'pie',
          name: 'Browser share',
          data: stats
        }]
      });
    });
  }
});
