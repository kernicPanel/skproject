
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
            $('#dialog-message').html('getting datas');
            socket.emit('redmineExtract::getIssues', function(err, datas) {
                //$('#dialog-message').html('');
                ////console.log("err : ", err);
                //console.log("datas[0] : ", datas[0]);
                //display.issuesArray(datas);
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

    var sumTimeEntry = function(total) {
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


    publicAccess.issuesArray = function (datas) {
        var $extract = $('#extract tbody');
        var loopCount = datas.length;
        moment.lang('fr');
        for (var i = 0; i < loopCount; i++) {
            var data = datas[i];
            publicAccess.issue(data);
        }
        delete loopCount;
    };

    publicAccess.issue = function (issue) {
        var $extract = $('#extract tbody');
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

            time: sumTimeEntry(issue.time_entriesTotal)
        });
        if (delaiFirstPostJourOuvre === 0) {
            $(issueHtml).addClass('excluded');
        }
        if (dateFirstPost === dateFerme || dateFirstPost === dateRejete) {
            //console.log("directClose : ", issue.id, issue);
            $(issueHtml).addClass('excluded directClose');
        }
        if (issue.stats.userFirstPost === issue.author.name) {
            //console.log("directClose : ", issue.id, issue);
            $(issueHtml).addClass('sameUser');
        }
        $extract.append($(issueHtml));
    };

    return publicAccess;
}());
