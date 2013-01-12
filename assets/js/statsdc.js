var volumeByPriorityChart = dc.pieChart('#your-chart');

var statsdc = function(data) {
  console.log('data', data);
  var total = data.length;

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
    return total;
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
      .colorDomain([-1750, 1644])
      // (optional) define color value accessor
      .colorAccessor(function(d, i){return d.value;})
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

  dc.renderAll();
};