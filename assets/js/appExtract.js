
var app = {
  // Classes
  Collections: {},
  Models: {},
  Views: {},
  // Instances
  collections: {},
  views: {},
  //Events
  socket: {},
  init: function () {
    this.socket = socket = io.connect();

    $('#sync').click(function() {
        console.log("sync : ");
        socket.emit('redmineExtract::sync', function (data) {
          console.log(data);
        });
    });

    socket.on('redmine::connect', function(data){
        console.log("redmine connect : ");

        $('#syncIssues').click(function() {
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

        socket.on('redmineExtract::getIssues::response', function(issue) {
            $('#dialog-message').html('');
            //console.log("err : ", err);
            //console.log("issue : ", issue.id, issue);
            display.issue(issue);
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


            var stats = ich.stats({
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
            });
            $stats.html(stats);

        }

    };

    return publicAccess;
}());
