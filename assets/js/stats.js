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
var stats = [];

var app = {
  init: function () {
    this.socket = socket = io.connect();

    var projectsLoaded = false;

    $('#sync').click(function() {
        console.log("sync : ");
        socket.emit('redmineStats::sync', function (data) {
          console.log(data);
        });
    });

    socket.on('connect', function(data){
        console.log("redmine connect : ");

        if (!projectsLoaded) {
            // socket.emit('redmineStats::getIssues', function(err, datas) {});
            socket.emit('redmineStats::getProjects', function(err, projects) {
                var current = '';

                // for (var i = projects.length - 1; i >= 0; i--) {
                for (var i = 0; i < projects.length; i++) {
                    var project = projects[i];
                    var projectOption = ich.projectOption({
                        id: project.id,
                        name: project.name,
                        current: current
                    });
                    $projectsSelect.append(projectOption);
                }
                projectsLoaded = true;

                $projectsSelect.on('change', function () {
                    socket.emit('redmineStats::setProject', this.value, function (err, project) {
                        setDates(project);
                    });
                });

            });
        }

        socket.on('redmineStats::getStats::response', function(issue) {
            $('#dialog-message').html('');
            //console.log("err : ", err);
            // console.log("issue : ", issue.id, issue);
            display.issue(issue);
            // issues.push(issue);
        });

        socket.on('redmineStats::getStats::done', function() {
            // displayGraphs(stats);
            // graph(issues);
            // graph(stats);
        });


        socket.on('log', function(source, data){
            logData = data;
            console.group("source : ", source);
            console.log("data : ", data);
            console.groupEnd();
        });
    });


    var $projectsForm = $('#projects');
    var $projectsSelect = $projectsForm.find('select');
    var $from = $('#from');
    var $to = $('#to');
    var $team = $('#team');
    var $closed = $('#closed');
    var $assignedToTeam = $('#assignedToTeam');
    var nowFormatted = moment(new Date()).format('DD/MM/YYYY');

    $from.val('23/09/2010');
    $to.val(nowFormatted);

    $from.datepicker({
        defaultDate: new Date(),
        dateFormat: "dd/mm/yy",
        changeMonth: true,
        changeYear: true,
        // numberOfMonths: 3,
        onClose: function( selectedDate ) {
            $to.datepicker( "option", "minDate", selectedDate );
        }
    });
    $to.datepicker({
        defaultDate: new Date(),
        dateFormat: "dd/mm/yy",
        changeMonth: true,
        changeYear: true,
        // numberOfMonths: 3,
        onClose: function( selectedDate ) {
            $from.datepicker( "option", "maxDate", selectedDate );
        }
    });
    $to.datepicker( "option", "minDate", $from.datepicker('getDate') );
    $from.datepicker( "option", "maxDate", $to.datepicker('getDate') );

    var setDates = function setDates (project) {
        console.log('project', project);
        var from = new Date(project.created_on);
        console.log('from', from);
        var fromFormatted = moment(from).format('DD/MM/YYYY');
        console.log('fromFormatted', fromFormatted);

        $from.val(fromFormatted);
        $from.datepicker( "option", "selectedDate", from );
        // $from.datepicker( "option", "minDate", from );
    };

    $('#getStats').click(function(){
        $('#stats').show();
        resetStats();
        var settings = {
            project: $projectsSelect.val(),
            from: $from.datepicker('getDate'),
            to: $to.datepicker('getDate'),
            teamPost: !!$team.attr('checked')
        };
        socket.emit('redmineStats::getStats', settings, function (err, data) {
            // console.log('err', err);
            // console.log('data', data);
        });
        return false;
    });

    var resetStats = function resetStats () {
        display.resetStats();
        if (typeof g !== 'undefined') {
            g.remove();
        }
    };

    $('#getIssuesStats').click(function(){
        // $('#stats').show();
        resetStats();
        var settings = {
            project: $projectsSelect.val(),
            from: $from.datepicker('getDate'),
            to: $to.datepicker('getDate'),
            teamPost: !!$team.attr('checked'),
            closed: !!$closed.attr('checked'),
            assignedToTeam: !!$assignedToTeam.attr('checked')
        };
        socket.emit('redmineStats::getIssuesStats', settings, function (err, data) {
            // console.log('err', err);
            // console.log('data', data);
            statsdc(data);
        });
        return false;
    });

  }
};


$(function() {
    $('html').removeClass('no-js').addClass('js');
    app.init();

});


var display = (function () {
    var publicAccess = {};

    var round2decimals = function(total) {
        return Math.round(total * 100) / 100;
    };

    var formatMoment = function(date) {
        if (date !== '') {
            return moment(date).format("D MMMM YYYY ddd, HH:mm");
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

    var $extract = $('#extract tbody');
    var $stats = $('#statsReport');

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

        $extract.html('');
        $stats.html('');
    };

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
        // console.log("issue : ", issue.id, issue);
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
        $extract.append($(issueHtml));


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
            else {
                nbDemandesMore++;
                sommeMore += delaiFirstPostJourOuvre;
            }
            sommeTotal += delaiFirstPostJourOuvre;
            ++nbDemandesTotal;

            ratio1h = round2decimals(nbDemandes1h / nbDemandesTotal);
            ratio2h = round2decimals(nbDemandes2h / nbDemandesTotal);
            ratio3h = round2decimals(nbDemandes3h / nbDemandesTotal);
            ratioMore = round2decimals(nbDemandesMore / nbDemandesTotal);
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


            var stat = {
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

                nbDemandesTotal: nbDemandesTotal,
                ratioTotal: ratioTotal,
                moyenneHeureTotal: moyenneHeureTotal,
                moyenneJourTotal: moyenneJourTotal
            };

            // console.log('stat', stat);
            var statsHtml = ich.stats(stat);
            $stats.html(statsHtml);

            // graph(stat);
            // stats[0]=stat;

            stats = [];
            // stats.push(stat);
            // stats.push({
            //     moyenneHeure1h: moyenneHeure1h,
            //     // moyenneHeure2h: moyenneHeure2h,
            //     // moyenneHeure3h: moyenneHeure3h,
            //     // moyenneHeureMore: moyenneHeureMore,
            //     sommeTotal: sommeTotal,
            //     nbDemandesTotal: nbDemandesTotal,
            //     moyenneHeureTotal: sommeTotal / nbDemandesTotal,
            // });

            stats.push({
                nbDemandes: nbDemandes1h,
                type: '- 1h',
                ratio: Math.round(ratio1h * 100, 1),
                nbDemandesTotal: nbDemandesTotal,
            });
            stats.push({
                nbDemandes: nbDemandes2h,
                type: '- 2h',
                ratio: Math.round(ratio2h * 100, 1),
                nbDemandesTotal: nbDemandesTotal,
            });
            stats.push({
                nbDemandes: nbDemandes3h,
                type: '- 3h',
                ratio: Math.round(ratio3h * 100, 1),
                nbDemandesTotal: nbDemandesTotal,
            });
            stats.push({
                nbDemandes: nbDemandesMore,
                type: '+ 3h',
                ratio: Math.round(ratioMore * 100, 1),
                nbDemandesTotal: nbDemandesTotal,
            });
            // stats.push(stat.moyenneHeure2h);
            // stats.push(stat.moyenneHeure3h);
            // stats.push(stat.moyenneHeureMore);

            // stats=stat;

            // chart.data([stat.nbDemandes1h])
            //     .style("width", function(d) { return d * 1 + "px"; })
            //     .text(function(d) { return d; });

            // displayGraphs(stat);
            graph(stat);
            update(stats);
            // g.data(pie([stat.nbDemandes1h]));
            // console.log('g', g);

        }

    };

    return publicAccess;
}());

var chart1h = d3.select("#less1")
    .attr("class", "chart")
    .append('div');

var label1h = chart1h.append('div')
    .attr("class", "label");

var chart2h = d3.select("#less2")
    .attr("class", "chart")
    .append('div');

var label2h = chart2h.append('div')
    .attr("class", "label");

var chart3h = d3.select("#less3")
    .attr("class", "chart")
    .append('div');

var label3h = chart3h.append('div')
    .attr("class", "label");

var chartMore = d3.select("#more")
    .attr("class", "chart")
    .append('div');

var labelMore = chartMore.append('div')
    .attr("class", "label");

var chartTotal = d3.select("#total")
    .attr("class", "chart")
    .append('div');

var labelTotal = chartTotal.append('div')
    .attr("class", "label");

var graph = function graph (stat) {

  var moyenneHeure1h = isNaN(stat.moyenneHeure1h) ?0 :stat.moyenneHeure1h;
  var moyenneHeure2h = isNaN(stat.moyenneHeure2h) ?0 :stat.moyenneHeure2h;
  var moyenneHeure3h = isNaN(stat.moyenneHeure3h) ?0 :stat.moyenneHeure3h;
  var moyenneHeureMore = isNaN(stat.moyenneHeureMore) ?0 :stat.moyenneHeureMore;
  var moyenneHeureTotal = isNaN(stat.moyenneHeureTotal) ?0 :stat.moyenneHeureTotal;

  var moyenneMax = Math.max(moyenneHeure1h, moyenneHeure2h, moyenneHeure3h, moyenneHeureMore);

  console.log('moyenneMax', moyenneMax);

  chart1h.data([stat])
    .style("width", function(d) {
      // console.log('d', d, isNaN(d));
      if (isNaN(d.moyenneHeure1h)) {
        return '0px';
      }
      return d.moyenneHeure1h * 100 / moyenneMax + "%";
    });

  label1h.data([stat.moyenneHeure1h])
    .text(function(d) {
      if (isNaN(d)) {
        return '-';
      }
      return d;
    });

  chart2h.data([stat])
    .style("width", function(d) {
      // console.log('d', d, isNaN(d));
      if (isNaN(d.moyenneHeure2h)) {
        return '0px';
      }
      return d.moyenneHeure2h * 100 / moyenneMax + "%";
    });

  label2h.data([stat.moyenneHeure2h])
    .text(function(d) {
      if (isNaN(d)) {
        return '-';
      }
      return d;
    });

  chart3h.data([stat])
    .style("width", function(d) {
      // console.log('d', d, isNaN(d));
      if (isNaN(d.moyenneHeure3h)) {
        return '0px';
      }
      return d.moyenneHeure3h * 100 / moyenneMax + "%";
    });

  label3h.data([stat.moyenneHeure3h])
    .text(function(d) {
      if (isNaN(d)) {
        return '-';
      }
      return d;
    });

  chartMore.data([stat])
    .style("width", function(d) {
      // console.log('d', d, isNaN(d.moyenneHeureMore));
      if (isNaN(d.moyenneHeureMore)) {
        return '0px';
      }
      return 100 + "%";
    });

  labelMore.data([stat.moyenneHeureMore])
    .text(function(d) {
      if (isNaN(d)) {
        return '-';
      }
      return d;
    });

  chartTotal.data([stat])
    .style("width", function(d) {
      // console.log('d', d, isNaN(d));
      if (isNaN(d.moyenneHeureTotal)) {
        return '0px';
      }
      return d.moyenneHeureTotal * 100 / moyenneMax + "%";
    });

  labelTotal.data([stat.moyenneHeureTotal])
    .text(function(d) {
      if (isNaN(d)) {
        return '-';
      }
      return d;
    });

};

var w = 450;
var h = 300;
var r = 100;
var ir = 45;
var textOffset = 14;
var tweenDuration = 250;

//OBJECTS TO BE POPULATED WITH DATA LATER
var lines, valueLabels, nameLabels;
var pieData = [];
var oldPieData = [];
var filteredPieData = [];

//D3 helper function to populate pie slice parameters from array data
var donut = d3.layout.pie().value(function(d){
  return d.nbDemandes;
});

//D3 helper function to create colors from an ordinal scale
var color = d3.scale.category20b();
// var color = d3.scale.ordinal()
//     // .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
//     .range(["#f00", "#0f0", "#00f", "#0ff"]);

// var color = {
//     '- 1h': '#0f0',
//     '- 2h': '#00f',
//     '- 3h': '#ff0',
//     '+ 3h': '#f00'
// };

//D3 helper function to draw arcs, populates parameter "d" in path object
var arc = d3.svg.arc()
  .startAngle(function(d){ return d.startAngle; })
  .endAngle(function(d){ return d.endAngle; })
  .innerRadius(ir)
  .outerRadius(r);

///////////////////////////////////////////////////////////
// GENERATE FAKE DATA /////////////////////////////////////
///////////////////////////////////////////////////////////

var arrayRange = 100000; //range of potential values for each item
var arraySize;
var streakerDataAdded;

function fillArray() {
  return {
    port: "port",
    octetTotalCount: Math.ceil(Math.random()*(arrayRange))
  };
}

///////////////////////////////////////////////////////////
// CREATE VIS & GROUPS ////////////////////////////////////
///////////////////////////////////////////////////////////

var vis = d3.select("#easy-as-pie-chart").append("svg:svg")
  .attr("width", w)
  .attr("height", h);

//GROUP FOR ARCS/PATHS
var arc_group = vis.append("svg:g")
  .attr("class", "arc")
  .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");

//GROUP FOR LABELS
var label_group = vis.append("svg:g")
  .attr("class", "label_group")
  .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");

//GROUP FOR CENTER TEXT
var center_group = vis.append("svg:g")
  .attr("class", "center_group")
  .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");

//PLACEHOLDER GRAY CIRCLE
var paths = arc_group.append("svg:circle")
    .attr("fill", "#EFEFEF")
    .attr("r", r);

///////////////////////////////////////////////////////////
// CENTER TEXT ////////////////////////////////////////////
///////////////////////////////////////////////////////////

//WHITE CIRCLE BEHIND LABELS
var whiteCircle = center_group.append("svg:circle")
  .attr("fill", "white")
  .attr("r", ir);

// "TOTAL" LABEL
var totalLabel = center_group.append("svg:text")
  .attr("class", "label")
  .attr("dy", -15)
  .attr("text-anchor", "middle") // text-align: right
  .text("TOTAL");

//TOTAL TRAFFIC VALUE
var totalValue = center_group.append("svg:text")
  .attr("class", "total")
  .attr("dy", 7)
  .attr("text-anchor", "middle") // text-align: right
  .text("Waiting...");

//UNITS LABEL
var totalUnits = center_group.append("svg:text")
  .attr("class", "units")
  .attr("dy", 21)
  .attr("text-anchor", "middle") // text-align: right
  .text("Issues");


///////////////////////////////////////////////////////////
// STREAKER CONNECTION ////////////////////////////////////
///////////////////////////////////////////////////////////

// var updateInterval = window.setInterval(update, 1500);

// to run each time data is generated
function update(data) {
  // console.log('data', data);

  arraySize = Math.ceil(Math.random()*10);
  // streakerDataAdded = d3.range(arraySize).map(fillArray);
  streakerDataAdded = data;

  oldPieData = filteredPieData;
  pieData = donut(streakerDataAdded);

  var totalDemandes = 0;
  filteredPieData = pieData.filter(filterData);
  function filterData(element, index, array) {
    element.name = streakerDataAdded[index].type;
    element.value = streakerDataAdded[index].nbDemandes;
    totalDemandes += element.value;
    return (element.value > 0);
  }

  if(filteredPieData.length > 0 && oldPieData.length > 0){

    //REMOVE PLACEHOLDER CIRCLE
    arc_group.selectAll("circle").remove();

    totalValue.text(function(){
      // var kb = totalDemandes/1024;
      // return kb.toFixed(1);
      return totalDemandes;
      //return bchart.label.abbreviated(totalDemandes*8);
    });

    //DRAW ARC PATHS
    paths = arc_group.selectAll("path").data(filteredPieData);
    paths.enter().append("svg:path")
      .attr("stroke", "white")
      .attr("stroke-width", 0.5)
      .attr("fill", function(d, i) {
        // console.log('i', i);
        // console.log('d.name', d.name, d);
        // console.log('color', color);
        // console.log('color[d.name]', d.name, color[d.name]);
        // return color[d.name];
        return color(i);
      })
      .transition()
        .duration(tweenDuration)
        .attrTween("d", pieTween);
    paths
      .transition()
        .duration(tweenDuration)
        .attrTween("d", pieTween);
    paths.exit()
      .transition()
        .duration(tweenDuration)
        .attrTween("d", removePieTween)
      .remove();

    //DRAW TICK MARK LINES FOR LABELS
    lines = label_group.selectAll("line").data(filteredPieData);
    lines.enter().append("svg:line")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", -r-3)
      .attr("y2", -r-8)
      .attr("stroke", "gray")
      .attr("transform", function(d) {
        return "rotate(" + (d.startAngle+d.endAngle)/2 * (180/Math.PI) + ")";
      });
    lines.transition()
      .duration(tweenDuration)
      .attr("transform", function(d) {
        return "rotate(" + (d.startAngle+d.endAngle)/2 * (180/Math.PI) + ")";
      });
    lines.exit().remove();

    //DRAW LABELS WITH PERCENTAGE VALUES
    valueLabels = label_group.selectAll("text.value").data(filteredPieData)
      .attr("dy", function(d){
        if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
          return 5;
        } else {
          return -7;
        }
      })
      .attr("text-anchor", function(d){
        if ( (d.startAngle+d.endAngle)/2 < Math.PI ){
          return "beginning";
        } else {
          return "end";
        }
      })
      .text(function(d){
        var percentage = (d.value/totalDemandes)*100;
        return d.value + " (" + percentage.toFixed(1) + "%)";
      });

    valueLabels.enter().append("svg:text")
      .attr("class", "value")
      .attr("transform", function(d) {
        return "translate(" + Math.cos(((d.startAngle+d.endAngle - Math.PI)/2)) * (r+textOffset) + "," + Math.sin((d.startAngle+d.endAngle - Math.PI)/2) * (r+textOffset) + ")";
      })
      .attr("dy", function(d){
        if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
          return 5;
        } else {
          return -7;
        }
      })
      .attr("text-anchor", function(d){
        if ( (d.startAngle+d.endAngle)/2 < Math.PI ){
          return "beginning";
        } else {
          return "end";
        }
      }).text(function(d){
        var percentage = (d.value/totalDemandes)*100;
        return percentage.toFixed(1) + "%";
      });

    valueLabels.transition().duration(tweenDuration).attrTween("transform", textTween);

    valueLabels.exit().remove();


    //DRAW LABELS WITH ENTITY NAMES
    nameLabels = label_group.selectAll("text.units").data(filteredPieData)
      .attr("dy", function(d){
        if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
          return 17;
        } else {
          return 5;
        }
      })
      .attr("text-anchor", function(d){
        if ((d.startAngle+d.endAngle)/2 < Math.PI ) {
          return "beginning";
        } else {
          return "end";
        }
      }).text(function(d){
        return d.name;
      });

    nameLabels.enter().append("svg:text")
      .attr("class", "units")
      .attr("transform", function(d) {
        return "translate(" + Math.cos(((d.startAngle+d.endAngle - Math.PI)/2)) * (r+textOffset) + "," + Math.sin((d.startAngle+d.endAngle - Math.PI)/2) * (r+textOffset) + ")";
      })
      .attr("dy", function(d){
        if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
          return 17;
        } else {
          return 5;
        }
      })
      .attr("text-anchor", function(d){
        if ((d.startAngle+d.endAngle)/2 < Math.PI ) {
          return "beginning";
        } else {
          return "end";
        }
      }).text(function(d){
        return d.name;
      });

    nameLabels.transition().duration(tweenDuration).attrTween("transform", textTween);

    nameLabels.exit().remove();
  }
}

///////////////////////////////////////////////////////////
// FUNCTIONS //////////////////////////////////////////////
///////////////////////////////////////////////////////////

// Interpolate the arcs in data space.
function pieTween(d, i) {
  var s0;
  var e0;
  if(oldPieData[i]){
    s0 = oldPieData[i].startAngle;
    e0 = oldPieData[i].endAngle;
  } else if (!(oldPieData[i]) && oldPieData[i-1]) {
    s0 = oldPieData[i-1].endAngle;
    e0 = oldPieData[i-1].endAngle;
  } else if(!(oldPieData[i-1]) && oldPieData.length > 0){
    s0 = oldPieData[oldPieData.length-1].endAngle;
    e0 = oldPieData[oldPieData.length-1].endAngle;
  } else {
    s0 = 0;
    e0 = 0;
  }
  var i = d3.interpolate({startAngle: s0, endAngle: e0}, {startAngle: d.startAngle, endAngle: d.endAngle});
  return function(t) {
    var b = i(t);
    return arc(b);
  };
}

function removePieTween(d, i) {
  s0 = 2 * Math.PI;
  e0 = 2 * Math.PI;
  var i = d3.interpolate({startAngle: d.startAngle, endAngle: d.endAngle}, {startAngle: s0, endAngle: e0});
  return function(t) {
    var b = i(t);
    return arc(b);
  };
}

function textTween(d, i) {
  var a;
  if(oldPieData[i]){
    a = (oldPieData[i].startAngle + oldPieData[i].endAngle - Math.PI)/2;
  } else if (!(oldPieData[i]) && oldPieData[i-1]) {
    a = (oldPieData[i-1].startAngle + oldPieData[i-1].endAngle - Math.PI)/2;
  } else if(!(oldPieData[i-1]) && oldPieData.length > 0) {
    a = (oldPieData[oldPieData.length-1].startAngle + oldPieData[oldPieData.length-1].endAngle - Math.PI)/2;
  } else {
    a = 0;
  }
  var b = (d.startAngle + d.endAngle - Math.PI)/2;

  var fn = d3.interpolateNumber(a, b);
  return function(t) {
    var val = fn(t);
    return "translate(" + Math.cos(val) * (r+textOffset) + "," + Math.sin(val) * (r+textOffset) + ")";
  };
}