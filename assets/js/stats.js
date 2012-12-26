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

    $('#sync').click(function() {
        console.log("sync : ");
        socket.emit('redmineStats::sync', function (data) {
          console.log(data);
        });
    });

    socket.on('connect', function(data){
        console.log("redmine connect : ");

        $('#syncIssues').click(function() {
            console.log('syncIssues');
            socket.emit('redmineStats::sync', function (err, data) {
                console.log("err : ", err);
                console.log("data : ", data);
            });
        });

        $('#buildStats').click(function() {
            socket.emit('redmineStats::buildStats', function (err, data) {
                console.log("err : ", err);
                console.log("data : ", data);
                console.log("stats builded !");
            });
        });

        $('#getIssues').click(function() {
            var $extract = $('#extract tbody');
            $extract.html('');
            $('#statsReport').html('');
            display.resetStats();
            $('#dialog-message').html('getting datas');
            socket.emit('redmineStats::getIssues', function(err, datas) {
            });
        });

        $('#getGarantie').click(function() {
            var $extract = $('#extract tbody');
            $extract.html('');
            $('#statsReport').html('');
            display.resetStats();
            $('#dialog-message').html('getting datas');
            socket.emit('redmineStats::getGarantie', function(err, datas) {
            });
        });

        $('#getSupport').click(function() {
            var $extract = $('#extract tbody');
            $extract.html('');
            $('#statsReport').html('');
            display.resetStats();
            $('#dialog-message').html('getting datas');
            socket.emit('redmineStats::getSupport', function(err, datas) {
            });
        });


        socket.emit('redmineStats::getIssues', function(err, datas) {});

        socket.on('redmineStats::getIssues::response', function(issue) {
            $('#dialog-message').html('');
            //console.log("err : ", err);
            // console.log("issue : ", issue.id, issue);
            display.issue(issue);
            // issues.push(issue);
        });

        socket.on('redmineStats::getIssues::done', function() {
            displayGraphs(stats);
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

                nbDemandesTotal: ++nbDemandesTotal,
                ratioTotal: ratioTotal,
                moyenneHeureTotal: moyenneHeureTotal,
                moyenneJourTotal: moyenneJourTotal
            };

            console.log('stat', stat);
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
                moyenneHeureTotal: nbDemandesTotal,
            });
            // stats.push(stat.moyenneHeure2h);
            // stats.push(stat.moyenneHeure3h);
            // stats.push(stat.moyenneHeureMore);

            // stats=stat;

            // chart.data([stat.nbDemandes1h])
            //     .style("width", function(d) { return d * 1 + "px"; })
            //     .text(function(d) { return d; });

            // displayGraphs(stat);
            // g.data(pie([stat.nbDemandes1h]));
            // console.log('g', g);

        }

    };

    return publicAccess;
}());

var chart = d3.select("#graph").selectAll("div")
    .attr("class", "chart")
    .append('div');

var graph = function graph (stat) {
    chart.data([stat.nbDemandes1h])
        .style("width", function(d) { return d * 1 + "px"; })
        .text(function(d) { return d; });
};

var width = 500,
    height = 300,
    radius = Math.min(width, height) / 2;

var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 70);

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) {
        // console.log('d pie', d);
        return d.nbDemandes;
    });

var svg = d3.select("#graph").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// d3.csv("data.csv", function(error, data) {
var displayGraphs = function(data) {
    // data = [data];
    // console.log('data', data);

  // data.forEach(function(d) {
  //   d.population = +d.population;
  // });

  var g = svg.selectAll(".arc")
      // .data(pie([data]))
      .data(pie(data))
      .enter().append("g")
      .attr("class", "arc");

  g.append("path")
      .attr("d", arc)
      .style("fill", function(d) {
        // console.log('d', d);
        return color(d.data.nbDemandes);
    });

  g.append("text")
      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text(function(d) { return d.data.type  +' : '+ d.data.nbDemandes + ' ('+d.data.ratio+'%)'; });

};
// });