RealTeam.UserController = Ember.ObjectController.extend({
  init: function(){
    console.log('init UserController');
  },
  updateCurrentIRCIssue: function (issue) {
    var user = RealTeam.User.find(issue.userId);
    var currentIRCIssue = null;
    user.set('currentIRCIssueTime', issue.issueTime);
    user.set('currentIRCIssueStatus', issue.issueStatus);
    if (issue.issueId !== 'Aucune') {
      currentIRCIssue = RealTeam.Issue.find(issue.issueId);
    }
    else {
      user.set('currentIRCIssueStatus', issue.issueId);
    }
    user.set('currentIRCIssue', currentIRCIssue);

//debugger;
  },
  updateCurrentIssue: function (issue) {
    console.log('updateCurrentIssue', issue);
  },
  runTimer: function(issue){
    var user = RealTeam.User.find(issue.userId);
    issue.currentTimer = new Date().getTime() - issue.startedAt + issue.pendingDuration - 60 * 60 * 1000;
    var currentIssue = RealTeam.Issue.find(issue.issueId);
    user.set("currentIssue", currentIssue);
    //user.set("currentIssueTime", issue.currentTimer);
    user.set("currentIssueStatus", issue.paused ? 'paused' : 'pending');
    user.set('currentTimerId', setInterval(function(){
      var currentTimer = user.get('currentIssueTime');
      user.set('currentIssueTime', currentTimer + 1000);
    }, 1000));
  },
  pauseTimer: function(issue){
    var user = RealTeam.User.find(issue.userId);
    clearInterval(user.get('currentTimerId'));
  },
  stopTimer: function(userId){
    var user = RealTeam.User.find(userId);
    user.set('currentIssueTime', - 60 * 60 * 1000);
    clearInterval(user.get('currentTimerId'));
  },
  start: function(issue){
    console.log('user start', issue.get('id'));
    RealTeam.currentuserController.start(issue);
  },
  sort: function(sort, asc){
    if (typeof asc === 'undefined') {
      asc = true;
    }
    var issuesSorted = this.get('issuesSorted');
    var sortProperties = issuesSorted.get('sortProperties');
    console.log('sortProperties', sortProperties);
    var sortAsc;
    if (sort === sortProperties[0]) {
      sortAsc = issuesSorted.get('sortAscending');
      issuesSorted.set('sortAscending', !sortAsc);
    }
    else {
      issuesSorted.set('sortProperties', [sort]);
      issuesSorted.set('sortAscending', asc);
    }
    sortAsc = issuesSorted.get('sortAscending');
    this.set('issuesDisplayed', this.get('issuesSorted'));
  },
  issuesSorted: function() {
    issues =  Ember.ArrayProxy.createWithMixins(Ember.SortableMixin, {
      sortProperties: RealTeam.issueSort,
      sortAscending: false,
      //filterProperty: {doneRatio: 0},
      content: this.get('model.issues')
    });

    //return issues.filterProperty('priority.name', 'Immédiat');

    return issues;
  }.property('model.issues.@each.id'),
  issuesDisplayed: function() {
    //return this.get('issuesSorted');
    return this.get('model.issues');
  }.property('model.issues.@each.id'),
  filterString: '',
  filterArray: [],
  filter: function(filter){
    var controller = this;
    var filterArray = this.get('filterArray');
    var isDisplayed, included;
    var issuesSorted = this.get('model.issues');
    if (filterArray.length) {
      var issuesDisplayed = issuesSorted.filter(function(item, index, self) {
        included = false;
        isDisplayed = -1;
        filterArray.forEach(function(filter, ind){
          filter = filter.text;
          filter = new RegExp(filter, 'i');
          item.eachRelationship(function(attr, val){
            if (!!item.get(attr) && !!item.get(attr).get('name')) {
              var attributeName = item.get(attr).get('name');
              if (!!attributeName && !!attributeName.toString().match(filter)) {
                ++isDisplayed;
              }
            }
          });
          item.eachAttribute(function(attr, val){
            if (!!item.get(attr)) {
              var attributeName = item.get(attr);
              if (!!attributeName && !!attributeName.toString().match(filter)) {
                ++isDisplayed;
              }
            }
          });
          included = (isDisplayed === ind);
        });
        return included;
      });
      this.set('issuesDisplayed', issuesDisplayed);
    }
    else {
      this.set('issuesDisplayed', this.get('model.issues'));
    }
    this.graph();
  },
  filtered: false,
  scope: function(arg){
    console.log('issue scope', arg);
    test = arg;
  },
  graph: function(){
    //console.log(this.get('issuesDisplayed'));
    var issuesDisplayed = this.get('issuesDisplayed').toArray();
    var ids = issuesDisplayed.map(function(issue){
      return 'ids%5B%5D=' + issue.id;
    });
    $.getJSON( '/statsUser/?' + ids.join('&'))
    .done(function( stats ) {
      $('#chartContainer').highcharts({
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false
        },
        title: {
          //text: 'Priority'
          text: ''
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
              //color: '#000000',
              //connectorColor: '#000000',
              formatter: function() {
                //console.log('formatter', this);
                var percentage = Math.round(this.percentage * 10) / 10;
                return '<b>'+ this.point.name +'</b> : ' + this.y;
              }
            },
            point: {
              events: {
                click: function(event) {
                  var $select2Search = $("#select2Search");
                  var filters = $select2Search.select2('data');
                  filters.push({id: this.name, text: this.name});
                  $select2Search.select2('data', filters).trigger("change");
                }
              }
            }
          }
        },
        series: [{
          type: 'pie',
          name: 'Issues',
          center: ['20%', '25%'],
          size: 100,
          data: stats.status
        },{
          type: 'pie',
          name: 'Issues',
          center: ['20%', '80%'],
          size: 100,
          data: stats.priority
        },{
          type: 'pie',
          name: 'Issues',
          center: ['70%', '50%'],
          size: 100,
          data: stats.project
        }]
      });
    });
  }
});

RealTeam.userController = RealTeam.UserController.create();

RealTeam.IssueFilter = Ember.TextField.extend({
  filterStringBinding: 'RealTeam.userController.filterString',
  change: function(evt) {
    this.get('controller').filter();
  }
});

RealTeam.UsersController = Ember.ArrayController.extend({
  sortProperties: ['name'],
  sortAscending: true
});

RealTeam.Select2Search = Ember.View.extend({
  templateName: "select2Search",
  didInsertElement: function (buffer) {
    //var issues = this.issuesDisplayed.get('content').toArray();
    var view = this;
    var controller = view.get('controller');
    $("#select2Search").select2({
      minimumInputLength: 2,
      tags:[],
      query: function (query) {
        var data = {results: []};
        var indexed = [];
        var issues = controller.get('issuesDisplayed').toArray();
        data.results.push({id: query.term, text: query.term});
        issues.forEach(function(issue){
          issue = RealTeam.Issue.find(issue.id);
          issue.eachRelationship(function(attr, val){
            if (!!issue.get(attr) && !!issue.get(attr).get('name')) {
              var attributeName = issue.get(attr).get('name');
              if (!indexed[attributeName]) {
                indexed[attributeName] = true;
                filter = new RegExp(query.term, 'i');
                if (!!attributeName && !!attributeName.toString().match(filter)) {
                  data.results.push({id: attributeName, text: attributeName});
                }
              }
            }
          });
          issue.eachAttribute(function(attr, val){
            if (!!issue.get(attr)) {
              var attributeName = issue.get(attr);
              if (!indexed[attributeName]) {
                indexed[attributeName] = true;
                filter = new RegExp(query.term, 'i');
                if (!!attributeName && !!attributeName.toString().match(filter)) {
                  data.results.push({id: attributeName, text: attributeName});
                }
              }
            }
          });
        });
        query.callback(data);
      }
    })
    .on('change', function(e){
      if ($(this).select2('data').length) {
        view.get('controller').set('filterArray', $(this).select2('data'));
      }
      else {
        view.get('controller').set('filterArray', []);
      }
      view.get('controller').filter();
    });

  }
});

RealTeam.UserGraphView = Ember.View.extend({
  templateName: "userGraph",
  didInsertElement: function () {
    //console.log(this.issuesDisplayed.get('content').toArray());
  }
});
