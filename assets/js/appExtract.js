/*

Copyright (c) 2012 Nicolas Clerc <kernicpanel@nclerc.fr>

This file is part of realTeam.

realTeam is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

realTeam is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with realTeam.  If not, see <http://www.gnu.org/licenses/>.

*/
var issues = [];

var app = {
  init: function () {
    this.socket = socket = io.connect();

    $('#sync').click(function() {
        console.log("sync : ");
        socket.emit('redmineExtract::sync', function (data) {
          console.log(data);
        });
    });

    socket.on('connect', function(data){
        console.log("redmine connect : ");

        $('#syncIssues').click(function() {
            console.log('syncIssues');
            socket.emit('redmineExtract::sync', function (err, data) {
                console.log("err : ", err);
                console.log("data : ", data);
            });
        });

        $('#buildStats').click(function() {
            socket.emit('redmineExtract::buildStats', function (err, data) {
                console.log("err : ", err);
                console.log("data : ", data);
                console.log("stats builded !");
            });
        });

        /*
         *socket.emit('redmineExtract::getProjects', function(err, datas) {
         *    console.log("err : ", err);
         *    console.log("data : ", data);
         *    var loopCount = datas.length;
         *    for (var i = 0; i < loopCount; i++) {
         *        var data = datas[i];
         *        console.log("data : ", data);
         *    }
         *    delete loopCount;
         *});
         */
        $('#getIssues').click(function() {
            var $extract = $('#extract tbody');
            $extract.html('');
            $('#statsReport').html('');
            display.resetStats();
            $('#dialog-message').html('getting datas');
            socket.emit('redmineExtract::getIssues', function(err, datas) {
                //$('#dialog-message').html('');
                ////console.log("err : ", err);
                //console.log("datas[0] : ", datas[0]);
                //display.issuesArray(datas);
            });
        });

        $('#getGarantie').click(function() {
            var $extract = $('#extract tbody');
            $extract.html('');
            $('#statsReport').html('');
            display.resetStats();
            $('#dialog-message').html('getting datas');
            socket.emit('redmineExtract::getGarantie', function(err, datas) {
            });
        });

        $('#getSupport').click(function() {
            var $extract = $('#extract tbody');
            $extract.html('');
            $('#statsReport').html('');
            display.resetStats();
            $('#dialog-message').html('getting datas');
            socket.emit('redmineExtract::getSupport', function(err, datas) {
            });
        });


        socket.emit('redmineExtract::getIssues', function(err, datas) {});

        socket.on('redmineExtract::getIssues::response', function(issue) {
            $('#dialog-message').html('');
            //console.log("err : ", err);
            //console.log("issue : ", issue.id, issue);
            display.issue(issue);
            // issues.push(issue);
        });

        socket.on('redmineExtract::getIssues::done', function() {
            // displayGraphs(issues);
        });

        socket.on('log', function(data){
            console.log("node log : ", data);
            test = data;
        });
    });
  }
};


$(function() {
    $('html').removeClass('no-js').addClass('js');
    app.init();

});


var display = (function () {
    var publicAccess = {};
/*
 *    var statuses = [];
 *    statuses[2] = 'Assigné';
 *    statuses[17] = 'En cours';
 *    statuses[16] = 'En attente';
 *    statuses[4] = 'Commentaire';
 *    statuses[8] = 'Développé';
 *    statuses[14] = 'A tester';
 *    statuses[7] = 'Testé';
 *    statuses[10] = 'A valider';
 *    statuses[9] = 'Validé';
 *    statuses[15] = 'A livrer';
 *    statuses[3] = 'Livré';
 *    statuses[5] = 'Fermé';
 *
 *    statuses.assigne = 2;
 *    statuses.enCours = 17;
 *    statuses.enAttente = 16;
 *    statuses.commentaire = 4;
 *    statuses.developpe = 8;
 *    statuses.aTester = 14;
 *    statuses.teste = 7;
 *    statuses.aValider = 10;
 *    statuses.valide = 9;
 *    statuses.aLivrer = 15;
 *    statuses.livre = 3;
 *    statuses.ferme = 5;
 */

    var round2decimals = function(total) {
        return Math.round(total * 100) / 100;
    };

    var formatMoment = function(date) {
        if (date !== '') {
            return moment(date).format("D MMMM YYYY ddd, HH:mm");
            //return moment(date).format("YY/MM/DD ddd HH:mm");
            //return moment(date).format("DD/MM/YY ddd HH:mm");
            //return new Date(date);
        }
        else {
            return '';
        }
    };

    var nbDemandes1h = 0;
    var nbDemandes2h = 0;
    var nbDemandes3h = 0;
    var nbDemandesMore = 0;
    var nbDemandesTotal = 0;

    var ratio1h = 0;
    var ratio2h = 0;
    var ratio3h = 0;
    var ratioMore = 0;
    var ratioTotal = 0;

    var moyenneHeure1h = 0;
    var moyenneHeure2h = 0;
    var moyenneHeure3h = 0;
    var moyenneHeureMore = 0;
    var moyenneHeureTotal = 0;

    var moyenneJour1h = 0;
    var moyenneJour2h = 0;
    var moyenneJour3h = 0;
    var moyenneJourMore = 0;
    var moyenneJourTotal = 0;

    var somme1h = 0;
    var somme2h = 0;
    var somme3h = 0;
    var sommeMore = 0;
    var sommeTotal = 0;

    publicAccess.resetStats = function() {
        nbDemandes1h = 0;
        nbDemandes2h = 0;
        nbDemandes3h = 0;
        nbDemandesMore = 0;
        nbDemandesTotal = 0;

        ratio1h = 0;
        ratio2h = 0;
        ratio3h = 0;
        ratioMore = 0;
        ratioTotal = 0;

        moyenneHeure1h = 0;
        moyenneHeure2h = 0;
        moyenneHeure3h = 0;
        moyenneHeureMore = 0;
        moyenneHeureTotal = 0;

        moyenneJour1h = 0;
        moyenneJour2h = 0;
        moyenneJour3h = 0;
        moyenneJourMore = 0;
        moyenneJourTotal = 0;

        somme1h = 0;
        somme2h = 0;
        somme3h = 0;
        sommeMore = 0;
        sommeTotal = 0;
    };

    var $extract = $('#extract tbody');
    var $stats = $('#statsReport');

    publicAccess.issuesArray = function (datas) {
        //var $extract = $('#extract tbody');
        var loopCount = datas.length;
        moment.lang('fr');
        for (var i = 0; i < loopCount; i++) {
            var data = datas[i];
            publicAccess.issue(data);
        }
        delete loopCount;
    };

    publicAccess.issue = function (issue) {
        //console.log("issue : ", issue);
        moment.lang('fr');
        var dateDemande = formatMoment(issue.created_on);

        var dateFirstPost = issue.stats.dateFirstPost ? formatMoment(issue.stats.dateFirstPost): '';
        var dateAValider = issue.stats.dateAValider ? formatMoment(issue.stats.dateAValider): '';
        var dateLivre = issue.stats.dateLivre ? formatMoment(issue.stats.dateLivre): '';
        var dateALivrer = issue.stats.dateALivrer ? formatMoment(issue.stats.dateALivrer): '';
        var dateFerme = issue.stats.dateFerme ? formatMoment(issue.stats.dateFerme): '';
        var dateRejete = issue.stats.dateRejete ? formatMoment(issue.stats.dateRejete): '';

        var delaiFirstPost = issue.stats.delaiFirstPost;
        var delaiFirstPostJourOuvre = issue.stats.delaiFirstPostJourOuvre;
        var delaiAValider = issue.stats.delaiAValider;
        var delaiAValiderJourOuvre = issue.stats.delaiAValiderJourOuvre;
        var delaiLivre = issue.stats.delaiLivre;
        var delaiLivreJourOuvre = issue.stats.delaiLivreJourOuvre;
        var delaiALivrer = issue.stats.delaiALivrer;
        var delaiALivrerJourOuvre = issue.stats.delaiALivrerJourOuvre;
        var delaiFerme = issue.stats.delaiFerme;
        var delaiFermeJourOuvre = issue.stats.delaiFermeJourOuvre;
        var delaiRejete = issue.stats.delaiRejete;
        var delaiRejeteJourOuvre = issue.stats.delaiRejeteJourOuvre;

        var issueHtml = ich.issue({
            nomSousProjet: issue.project.name,
            numTache: issue.id,
            nomTache: issue.subject,
            dateDemande: dateDemande,
            userDateDemande: issue.author.name,

            userDateFirstPost: issue.stats.userFirstPost,
            dateFirstPost: dateFirstPost,
            dateAValider: dateAValider,
            dateLivre: dateLivre,
            dateALivrer: dateALivrer,
            dateFerme: dateFerme,
            dateRejete: dateRejete,

            delaiFirstPost: delaiFirstPost,
            delaiAValider: delaiAValider,
            delaiLivre: delaiLivre,
            delaiALivrer: delaiALivrer,
            delaiFerme: delaiFerme,
            delaiRejete: delaiRejete,

            delaiFirstPostJourOuvre: delaiFirstPostJourOuvre,
            delaiAValiderJourOuvre: delaiAValiderJourOuvre,
            delaiLivreJourOuvre: delaiLivreJourOuvre,
            delaiALivrerJourOuvre: delaiALivrerJourOuvre,
            delaiFermeJourOuvre: delaiFermeJourOuvre,
            delaiRejeteJourOuvre: delaiRejeteJourOuvre,

            time: round2decimals(issue.time_entriesTotal)
        });

        var excluded = false;
        if (delaiFirstPostJourOuvre === 0) {
            $(issueHtml).addClass('excluded');
            excluded = true;
        }
        if (dateFirstPost === dateFerme || dateFirstPost === dateRejete) {
            //console.log("directClose : ", issue.id, issue);
            $(issueHtml).addClass('excluded directClose');
            excluded = true;
        }
        /*
         *if (issue.stats.userFirstPost === issue.author.name) {
         *    $(issueHtml).addClass('sameUser');
         *}
         */
        $extract.append($(issueHtml));

        /*
         *$('.delaiFirstPostJourOuvre').each(function(index) {
         *        alert(index + ': ' + $(this).text());
         *});
         */

        if (!excluded) {

            if (delaiFirstPostJourOuvre < 1) {
                nbDemandes1h++;
                somme1h += delaiFirstPostJourOuvre;
            }
            else if (delaiFirstPostJourOuvre < 2) {
                nbDemandes2h++;
                somme2h += delaiFirstPostJourOuvre;
            }
            else if (delaiFirstPostJourOuvre < 3) {
                nbDemandes3h++;
                somme3h += delaiFirstPostJourOuvre;
            }
            //else if (delaiFirstPostJourOuvre > 3) {
            else {
                nbDemandesMore++;
                sommeMore += delaiFirstPostJourOuvre;
            }
            sommeTotal += delaiFirstPostJourOuvre;

            ratio1h = round2decimals(nbDemandes1h / nbDemandesTotal);
            ratio2h = round2decimals(nbDemandes2h / nbDemandesTotal);
            ratio3h = round2decimals(nbDemandes3h / nbDemandesTotal);
            ratioMore = round2decimals(nbDemandesMore / nbDemandesTotal);
            //ratioTotal = round2decimals(nbDemandesTotal / nbDemandesTotal);
            ratioTotal = round2decimals( (nbDemandes1h + nbDemandes2h + nbDemandes3h + nbDemandesMore ) / nbDemandesTotal );

            moyenneHeure1h = round2decimals(somme1h / nbDemandes1h);
            moyenneHeure2h = round2decimals(somme2h / nbDemandes2h);
            moyenneHeure3h = round2decimals(somme3h / nbDemandes3h);
            moyenneHeureMore = round2decimals(sommeMore / nbDemandesMore);
            moyenneHeureTotal = round2decimals(sommeTotal / nbDemandesTotal);

            moyenneJour1h = round2decimals(somme1h / nbDemandes1h / 7);
            moyenneJour2h = round2decimals(somme2h / nbDemandes2h / 7);
            moyenneJour3h = round2decimals(somme3h / nbDemandes3h / 7);
            moyenneJourMore = round2decimals(sommeMore / nbDemandesMore / 7);
            moyenneJourTotal = round2decimals(sommeTotal / nbDemandesTotal / 7);


            var stats = {
                nbDemandes1h: nbDemandes1h,
                ratio1h: ratio1h,
                moyenneHeure1h: moyenneHeure1h,
                moyenneJour1h: moyenneJour1h,

                nbDemandes2h: nbDemandes2h,
                ratio2h: ratio2h,
                moyenneHeure2h: moyenneHeure2h,
                moyenneJour2h: moyenneJour2h,

                nbDemandes3h: nbDemandes3h,
                ratio3h: ratio3h,
                moyenneHeure3h: moyenneHeure3h,
                moyenneJour3h: moyenneJour3h,

                nbDemandesMore: nbDemandesMore,
                ratioMore: ratioMore,
                moyenneHeureMore: moyenneHeureMore,
                moyenneJourMore: moyenneJourMore,

                nbDemandesTotal: ++nbDemandesTotal,
                ratioTotal: ratioTotal,
                moyenneHeureTotal: moyenneHeureTotal,
                moyenneJourTotal: moyenneJourTotal
            };

            var statsHtml = ich.stats(stats);
            $stats.html(statsHtml);
            graph(stats);

        }

    };

    return publicAccess;
}());

var chart = d3.select("#graph").append("div")
    .attr("class", "chart");

var graph = function graph (data) {
    // console.log('data', data);
    chart.selectAll("div")
        .data(data)
        .enter().append("div")
        .style("width", function(d) { return d * 10 + "px"; })
        .text(function(d) { return d; });
};

/*
var margin = {top: 5, right: 40, bottom: 20, left: 120},
    width = 960 - margin.left - margin.right,
    height = 50 - margin.top - margin.bottom;

var chart = d3.bullet()
    .width(width)
    .height(height);

var graph = function graph (data) {

  var svg = d3.select("body").selectAll("svg")
      .data(data)
    .enter().append("svg")
      .attr("class", "bullet")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(chart);

  var title = svg.append("g")
      .style("text-anchor", "end")
      .attr("transform", "translate(-6," + height / 2 + ")");

  title.append("text")
      .attr("class", "title")
      .text(function(d) { console.log('d', d); return d.title; });

  title.append("text")
      .attr("class", "subtitle")
      .attr("dy", "1em")
      .text(function(d) { return d.subtitle; });

  d3.selectAll("button").on("click", function() {
    svg.datum(randomize).call(chart.duration(1000)); // TODO automatic transition
  });
};

function randomize(d) {
  if (!d.randomizer) d.randomizer = randomizer(d);
  d.ranges = d.ranges.map(d.randomizer);
  d.markers = d.markers.map(d.randomizer);
  d.measures = d.measures.map(d.randomizer);
  return d;
}

function randomizer(d) {
  var k = d3.max(d.ranges) * 0.2;
  return function(d) {
    return Math.max(0, d + k * (Math.random() - 0.5));
  };
}
*/

/*
// d3.csv("flights-3m.json", function(flights) {
var displayGraphs = function(issues) {

  // Various formatters.
  var formatNumber = d3.format(",d"),
      formatChange = d3.format("+,d"),
      formatDate = d3.time.format("%B %d, %Y"),
      formatTime = d3.time.format("%I:%M %p");

  // A nest operator, for grouping the flight list.
  var nestByDate = d3.nest()
      .key(function(d) { return d3.time.day(d.created_on); });

  // A little coercion, since the CSV is untyped.
  issues.forEach(function(d, i) {
    d.index = i;
    d.created_on = parseDate(d.created_on);
    // d.delay = +d.delay;
    // d.distance = +d.distance;
  });

  // Create the crossfilter for the relevant dimensions and groups.
  var flight = crossfilter(issues),
      all = flight.groupAll(),
      created_on = flight.dimension(function(d) { return d3.time.day(d.created_on); }),
      created_ons = created_on.group(),
      hour = flight.dimension(function(d) { return d.created_on.getHours() + d.created_on.getMinutes() / 60; }),
      hours = hour.group(Math.floor),
      delay = flight.dimension(function(d) { return Math.max(-60, Math.min(149, d.delay)); }),
      delays = delay.group(function(d) { return Math.floor(d / 10) * 10; }),
      distance = flight.dimension(function(d) { return Math.min(1999, d.distance); }),
      distances = distance.group(function(d) { return Math.floor(d / 50) * 50; });

  var charts = [

    barChart()
        .dimension(hour)
        .group(hours)
      .x(d3.scale.linear()
        .domain([0, 24])
        .rangeRound([0, 10 * 24])),

    barChart()
        .dimension(delay)
        .group(delays)
      .x(d3.scale.linear()
        .domain([-60, 150])
        .rangeRound([0, 10 * 21])),

    barChart()
        .dimension(distance)
        .group(distances)
      .x(d3.scale.linear()
        .domain([0, 2000])
        .rangeRound([0, 10 * 40])),

    barChart()
        .dimension(created_on)
        .group(created_ons)
        .round(d3.time.day.round)
      .x(d3.time.scale()
        .domain([new Date(2001, 0, 1), new Date(2001, 3, 1)])
        .rangeRound([0, 10 * 90]))
        .filter([new Date(2001, 1, 1), new Date(2001, 2, 1)])

  ];

  // Given our array of charts, which we assume are in the same order as the
  // .chart elements in the DOM, bind the charts to the DOM and render them.
  // We also listen to the chart's brush events to update the display.
  var chart = d3.selectAll(".chart")
      .data(charts)
      .each(function(chart) { chart.on("brush", renderAll).on("brushend", renderAll); });

  // Render the initial lists.
  var list = d3.selectAll(".list")
      .data([flightList]);

  // Render the total.
  d3.selectAll("#total")
      .text(formatNumber(flight.size()));

  renderAll();

  // Renders the specified chart or list.
  function render(method) {
    d3.select(this).call(method);
  }

  // Whenever the brush moves, re-rendering everything.
  function renderAll() {
    chart.each(render);
    list.each(render);
    d3.select("#active").text(formatNumber(all.value()));
  }

  // Like d3.time.format, but faster.
  function parseDate(d) {
    return new Date(2001,
        d.substring(0, 2) - 1,
        d.substring(2, 4),
        d.substring(4, 6),
        d.substring(6, 8));
  }

  window.filter = function(filters) {
    filters.forEach(function(d, i) { charts[i].filter(d); });
    renderAll();
  };

  window.reset = function(i) {
    charts[i].filter(null);
    renderAll();
  };

  function flightList(div) {
    var issuesByDate = nestByDate.entries(date.top(40));

    div.each(function() {
      var date = d3.select(this).selectAll(".date")
          .data(issuesByDate, function(d) { return d.key; });

      date.enter().append("div")
          .attr("class", "date")
        .append("div")
          .attr("class", "day")
          .text(function(d) { return formatDate(d.values[0].date); });

      date.exit().remove();

      var flight = date.order().selectAll(".flight")
          .data(function(d) { return d.values; }, function(d) { return d.index; });

      var flightEnter = flight.enter().append("div")
          .attr("class", "flight");

      flightEnter.append("div")
          .attr("class", "time")
          .text(function(d) { return formatTime(d.date); });

      flightEnter.append("div")
          .attr("class", "origin")
          .text(function(d) { return d.origin; });

      flightEnter.append("div")
          .attr("class", "destination")
          .text(function(d) { return d.destination; });

      flightEnter.append("div")
          .attr("class", "distance")
          .text(function(d) { return formatNumber(d.distance) + " mi."; });

      flightEnter.append("div")
          .attr("class", "delay")
          .classed("early", function(d) { return d.delay < 0; })
          .text(function(d) { return formatChange(d.delay) + " min."; });

      flight.exit().remove();

      flight.order();
    });
  }

  function barChart() {
    if (!barChart.id) barChart.id = 0;

    var margin = {top: 10, right: 10, bottom: 20, left: 10},
        x,
        y = d3.scale.linear().range([100, 0]),
        id = barChart.id++,
        axis = d3.svg.axis().orient("bottom"),
        brush = d3.svg.brush(),
        brushDirty,
        dimension,
        group,
        round;

    function chart(div) {
      var width = x.range()[1],
          height = y.range()[0];
console.log('group.top(1)', group.top(1));
      y.domain([0, group.top(1)[0].value]);

      div.each(function() {
        var div = d3.select(this),
            g = div.select("g");

        // Create the skeletal chart.
        if (g.empty()) {
          div.select(".title").append("a")
              .attr("href", "javascript:reset(" + id + ")")
              .attr("class", "reset")
              .text("reset")
              .style("display", "none");

          g = div.append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          g.append("clipPath")
              .attr("id", "clip-" + id)
            .append("rect")
              .attr("width", width)
              .attr("height", height);

          g.selectAll(".bar")
              .data(["background", "foreground"])
            .enter().append("path")
              .attr("class", function(d) { return d + " bar"; })
              .datum(group.all());

          g.selectAll(".foreground.bar")
              .attr("clip-path", "url(#clip-" + id + ")");

          g.append("g")
              .attr("class", "axis")
              .attr("transform", "translate(0," + height + ")")
              .call(axis);

          // Initialize the brush component with pretty resize handles.
          var gBrush = g.append("g").attr("class", "brush").call(brush);
          gBrush.selectAll("rect").attr("height", height);
          gBrush.selectAll(".resize").append("path").attr("d", resizePath);
        }

        // Only redraw the brush if set externally.
        if (brushDirty) {
          brushDirty = false;
          g.selectAll(".brush").call(brush);
          div.select(".title a").style("display", brush.empty() ? "none" : null);
          if (brush.empty()) {
            g.selectAll("#clip-" + id + " rect")
                .attr("x", 0)
                .attr("width", width);
          } else {
            var extent = brush.extent();
            g.selectAll("#clip-" + id + " rect")
                .attr("x", x(extent[0]))
                .attr("width", x(extent[1]) - x(extent[0]));
          }
        }

        g.selectAll(".bar").attr("d", barPath);
      });

      function barPath(groups) {
        var path = [],
            i = -1,
            n = groups.length,
            d;
        while (++i < n) {
          d = groups[i];
          path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
        }
        return path.join("");
      }

      function resizePath(d) {
        var e = +(d == "e"),
            x = e ? 1 : -1,
            y = height / 3;
        return "M" + (.5 * x) + "," + y
            + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
            + "V" + (2 * y - 6)
            + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
            + "Z"
            + "M" + (2.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8)
            + "M" + (4.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8);
      }
    }

    brush.on("brushstart.chart", function() {
      var div = d3.select(this.parentNode.parentNode.parentNode);
      div.select(".title a").style("display", null);
    });

    brush.on("brush.chart", function() {
      var g = d3.select(this.parentNode),
          extent = brush.extent();
      if (round) g.select(".brush")
          .call(brush.extent(extent = extent.map(round)))
        .selectAll(".resize")
          .style("display", null);
      g.select("#clip-" + id + " rect")
          .attr("x", x(extent[0]))
          .attr("width", x(extent[1]) - x(extent[0]));
      dimension.filterRange(extent);
    });

    brush.on("brushend.chart", function() {
      if (brush.empty()) {
        var div = d3.select(this.parentNode.parentNode.parentNode);
        div.select(".title a").style("display", "none");
        div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
        dimension.filterAll();
      }
    });

    chart.margin = function(_) {
      if (!arguments.length) return margin;
      margin = _;
      return chart;
    };

    chart.x = function(_) {
      if (!arguments.length) return x;
      x = _;
      axis.scale(x);
      brush.x(x);
      return chart;
    };

    chart.y = function(_) {
      if (!arguments.length) return y;
      y = _;
      return chart;
    };

    chart.dimension = function(_) {
      if (!arguments.length) return dimension;
      dimension = _;
      return chart;
    };

    chart.filter = function(_) {
      if (_) {
        brush.extent(_);
        dimension.filterRange(_);
      } else {
        brush.clear();
        dimension.filterAll();
      }
      brushDirty = true;
      return chart;
    };

    chart.group = function(_) {
      if (!arguments.length) return group;
      group = _;
      return chart;
    };

    chart.round = function(_) {
      if (!arguments.length) return round;
      round = _;
      return chart;
    };

    return d3.rebind(chart, brush, "on");
  }
};
*/