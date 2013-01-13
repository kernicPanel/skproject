var volumeByPriorityChart = dc.pieChart('#volumeByPriorityChart');
var volumeByAssignmentChart = dc.pieChart('#volumeByAssignmentChart');
var volumeByStatusChart = dc.pieChart('#volumeByStatusChart');
var issuesTable = dc.dataTable("#issuesTable");

var statsdc = function(data) {

  data.forEach(function(e) {
    e.assigned = e.assigned_to.name ?e.assigned_to.name :'none';
  });

  console.log('data', data);
  var volume = data.length;
  console.log('volume', volume);

  // feed it through crossfilter
  var ndx = crossfilter(data);

  // // define group all for counting
  var all = ndx.groupAll();
  // console.log('all', all);

  // // define a dimension
  var volumeByPriority = ndx.dimension(function(d) {
    // console.log('d', d);
    // return d3.time.month(d.dd);
    return d.priority.name;
  });

  var volumeByStatus = ndx.dimension(function(d) {
    return d.status.name;
  });

  var volumeByAssignment = ndx.dimension(function(d) {
    // return d.assigned_to.name;
    return d.assigned;
  });

  // // map/reduce to group sum
  var volumeByPriorityGroup = volumeByPriority.group().reduceSum(function(d) {
    // console.log('d', d);
    return 1;
  });

  var volumeByAssignmentGroup = volumeByAssignment.group().reduceSum(function(d) {
    return 1;

    // if (!!d.assigned_to.name) {
    //   return 1;
    // }
    // return 0;
  });

  var volumeByStatusGroup = volumeByStatus.group().reduceSum(function(d) {
    // console.log('d', d);
    return 1;
  });


  /* Create a pie chart and use the given css selector as anchor. You can also specify
   * an optional chart group for this chart to be scoped within. When a chart belongs
   * to a specific group then any interaction with such chart will only trigger redraw
   * on other charts within the same chart group. */
  // dc.pieChart("#your-chart", "volumeByPriorityGroup")
  volumeByPriorityChart
      .width(200) // (optional) define chart width, :default = 200
      .height(200) // (optional) define chart height, :default = 200
      .transitionDuration(500) // (optional) define chart transition duration, :default = 350
      // (optional) define color array for slices
      .colors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
      // (optional) define color domain to match your data domain if you want to bind data or color
      // .colorDomain([-1750, 1644])
      // (optional) define color value accessor
      // .colorAccessor(function(d, i){return d.value;})
      .radius(90) // define pie radius
      // (optional) if inner radius is used then a donut chart will
      // be generated instead of pie chart
      .innerRadius(40)
      .dimension(volumeByPriority) // set dimension
      .group(volumeByPriorityGroup) // set group
      // (optional) by default pie chart will use group.key as it's label
      // but you can overwrite it with a closure
      // .label(function(d) { return d.data.key + "(" + Math.floor(d.data.value / all.value() * 100) + "%)"; })
      .minAngleForLabel(0)
      .label(function(d) {
        var deltaAngle = d.endAngle - d.startAngle;
        // console.log('deltaAngle', deltaAngle);
        // var label = d.data.key;
        if (deltaAngle < 0.4) {
          // label = label[0];
          return d.data.key[0];
        }
        return d.data.key + " (" + d.data.value + ")";
      })
      // (optional) whether chart should render labels, :default = true
      .renderLabel(true)
      // (optional) by default pie chart will use group.key and group.value as its title
      // you can overwrite it with a closure
      // .title(function(d) { return d.data.key + "(" + Math.floor(d.data.value / all.value() * 100) + "%)"; })
      // (optional) whether chart should render titles, :default = false
      .renderTitle(true);

  volumeByAssignmentChart
      .width(200)
      .height(200)
      .transitionDuration(500)
      .colors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
      // .colorDomain([-1750, 1644])
      // .colorAccessor(function(d, i){return d.value;})
      .radius(90)
      .innerRadius(40)
      .dimension(volumeByAssignment)
      .group(volumeByAssignmentGroup)
      .minAngleForLabel(0)
      .label(function(d) {
        var deltaAngle = d.endAngle - d.startAngle;
        if (deltaAngle < 0.4) {
          return d.data.key[0];
        }
        return d.data.key + " (" + d.data.value + ")";
      })
      .renderLabel(true)
      .renderTitle(true);


  volumeByStatusChart
      .width(200)
      .height(200)
      .transitionDuration(500)
      .colors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
      // .colorDomain([-1750, 1644])
      // .colorAccessor(function(d, i){return d.value;})
      .radius(90)
      .innerRadius(40)
      .dimension(volumeByStatus)
      .group(volumeByStatusGroup)
      .minAngleForLabel(0)
      .label(function(d) {
        var deltaAngle = d.endAngle - d.startAngle;
        if (deltaAngle < 0.4) {
          return d.data.key[0];
        }
        return d.data.key + " (" + d.data.value + ")";
      })
      .renderLabel(true)
      .renderTitle(true);

  issuesTable
    .dimension(volumeByPriority)
    // data table does not use crossfilter group but rather a closure
    // as a grouping function
    .group(function(d) {
        return d.assigned_to.name;
    })
    // (optional) max number of records to be shown, :default = 25
    .size(100000)
    // dynamic columns creation using an array of closures
    .columns([
        function(d) { return d.id; },
        function(d) { return d.time_entriesTotal; },
        function(d) { return d.estimated_hours; },
        function(d) { return d.done_ratio; },
        function(d) { return d.priority.name; },
        function(d) { return d.assigned; },
        function(d) { return d.status.name; }
    ])
    // (optional) sort using the given field, :default = function(d){return d;}
    .sortBy(function(d){ return d.assigned_to.name; })
    // (optional) sort order, :default ascending
    .order(d3.ascending);

  dc.renderAll();
};