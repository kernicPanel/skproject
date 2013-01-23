var issuesChart = dc.barChart("#issuesChart");
var volumeByPriorityChart = dc.pieChart('#volumeByPriorityChart');
var volumeByAssignmentChart = dc.pieChart('#volumeByAssignmentChart');
var volumeByStatusChart = dc.pieChart('#volumeByStatusChart');
var issuesTable = dc.dataTable("#issuesTable");

var statsdc = function(data) {

  var minID = Number.MAX_VALUE, maxID = Number.MIN_VALUE;

  data.forEach(function(e) {
    e.assigned = e.assigned_to.name ?e.assigned_to.name :'none';
    if (!e.estimated_hours) e.estimated_hours = 0;

    console.log('e.id', e.id);
    minID = Math.min(minID, e.id);
    maxID = Math.max(maxID, e.id);
  });

  console.log('data', data);
  var volume = data.length;
  console.log('volume', volume, minID, maxID);

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

  // // map/reduce to group sum
  var volumeByPriorityGroup = volumeByPriority.group().reduceSum(function(d) {
    // console.log('d', d);
    return 1;
  });

  var volumeByAssignment = ndx.dimension(function(d) {
    // return d.assigned_to.name;
    return d.assigned;
  });

  var volumeByAssignmentGroup = volumeByAssignment.group().reduceSum(function(d) {
    return 1;

    // if (!!d.assigned_to.name) {
    //   return 1;
    // }
    // return 0;
  });

  var volumeByStatus = ndx.dimension(function(d) {
    return d.status.name;
  });

  var volumeByStatusGroup = volumeByStatus.group().reduceSum(function(d) {
    // console.log('d', d);
    return 1;
  });

  var volumeByEstimatedTime = ndx.dimension(function(d) {
    // return d.assigned_to.name;
    return d.estimated_hours;
    // return 1;
  });

  var volumeByEstimatedTimeGroup = volumeByEstimatedTime.group();

  /* Create a bar chart and use the given css selector as anchor. You can also specify
   * an optional chart group for this chart to be scoped within. When a chart belongs
   * to a specific group then any interaction with such chart will only trigger redraw
   * on other charts within the same chart group. */
  issuesChart
    .width(990) // (optional) define chart width, :default = 200
    .height(250) // (optional) define chart height, :default = 200
    .transitionDuration(500) // (optional) define chart transition duration, :default = 500
    // (optional) define margins
    // .margins({top: 10, right: 50, bottom: 30, left: 40})
    .dimension(volumeByEstimatedTime) // set dimension
    .group(volumeByEstimatedTimeGroup) // set group
    // (optional) whether chart should rescale y axis to fit data, :default = false
    .elasticY(true)
    // (optional) when elasticY is on whether padding should be applied to y axis domain, :default=0
    // .yAxisPadding(100)
    // (optional) whether chart should rescale x axis to fit data, :default = false
    // .elasticX(true)
    // (optional) when elasticX is on whether padding should be applied to x axis domain, :default=0
    .xAxisPadding(500)
    // define x scale
    // .x(d3.time.scale().domain([new Date(1985, 0, 1), new Date(2012, 11, 31)]))
    .x(
      // test = d3.time.scale().domain([new Date(1985, 0, 1), new Date(2012, 11, 31)])
      d3.scale.linear().domain([minID, maxID])
      )
    // (optional) set filter brush rounding
    .round(dc.round.floor)
    // define x axis units
    // .xUnits(d3.time.months)
    // (optional) whether bar should be center to its x value, :default=false
    .centerBar(true)
    // (optional) set gap between bars manually in px, :default=2
    // .barGap(1)
    // (optional) render horizontal grid lines, :default=false
    // .renderHorizontalGridLines(true)
    // (optional) render vertical grid lines, :default=false
    // .renderVerticalGridLines(true)
    // (optional) add stacked group and custom value retriever
    // .stack(monthlyMoveGroup, function(d){return d.value;})
    // (optional) you can add multiple stacked group with or without custom value retriever
    // if no custom retriever provided base chart's value retriever will be used
    // .stack(monthlyMoveGroup)
    // (optional) whether this chart should generate user interactive brush to allow range
    // selection, :default=true.
    // .brushOn(true)
    // (optional) whether svg title element(tooltip) should be generated for each bar using
    // the given function, :default=no
    .title(function(d) { return "Value: " + d.value; })
    // (optional) whether chart should render titles, :default = false
    .renderTitle(true);

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
        function(d) { return '<a target="_blank" href="' + d.url +'">' + d.id + '</a>'; },
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