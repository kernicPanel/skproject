
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

        socket.on('redmineExtract::getIssues::response', function(data) {
            $('#dialog-message').html('');
            //console.log("err : ", err);
            console.log("data : ", data);
            display.issue(data);
        });

        socket.on('log', function(data){
            console.log("node log : ", data);
            test = data;
        });
    });
  }
};


$(function() {
    app.init();

});


var display = (function () {
    var publicAccess = {};
    var statuses = [];
    statuses[2] = 'Assigné';
    statuses[17] = 'En cours';
    statuses[16] = 'En attente';
    statuses[4] = 'Commentaire';
    statuses[8] = 'Développé';
    statuses[14] = 'A tester';
    statuses[7] = 'Testé';
    statuses[10] = 'A valider';
    statuses[9] = 'Validé';
    statuses[15] = 'A livrer';
    statuses[3] = 'Livré';
    statuses[5] = 'Fermé';

    statuses.assigne = 2;
    statuses.enCours = 17;
    statuses.enAttente = 16;
    statuses.commentaire = 4;
    statuses.developpe = 8;
    statuses.aTester = 14;
    statuses.teste = 7;
    statuses.aValider = 10;
    statuses.valide = 9;
    statuses.aLivrer = 15;
    statuses.livre = 3;
    statuses.ferme = 5;

    var sumTimeEntry = function(data) {
        var totalTime = 0;
        var loopCount = data.time_entries.length;
        for (var i = 0; i < loopCount; i++) {
            timeEntry = data.time_entries[i];
            //totalTime += parseFloat(timeEntry.hours);
            totalTime += timeEntry.hours;
        }
        delete loopCount;
        totalTime = Math.round(totalTime * 100) / 100;
        return totalTime.toString().replace('.', ',');
    };

    var firstStatus = function(data, type) {
        var journals = data.journals;
        //var iLoopCount = journals.length -1;
        //for (var i = iLoopCount; i >= 0; i--) {
        var iLoopCount = journals.length;
        for (var i = 0; i < iLoopCount; i++) {
            var journal = journals[i];
            var details = journal.details;
            var jLoopCount = details.length;
            for (var j = 0; j < jLoopCount; j++) {
                var detail = details[j];
                //console.log("detail.name : ", detail.name);
                if (detail.name === 'status_id' && detail.new_value == statuses[type]) {
                    //console.log("journal.created_on : ", journal.created_on);
                    //console.log("journal : ", journal);
                    return journal.created_on;
                }
            }
            delete loopCount;
        }
        return '';
        delete loopCount;
    };

    var firstJournal = function(data) {
        var journals = data.journals;
        //console.log("journals : ", journals);
        if (!journals) {
            return false;
        }
        var firstJournal = journals[0];
        //console.log("firstJournal : ", firstJournal);
        return firstJournal;
    };

    var firstJournalDate = function(data) {
        return firstJournal(data) ? firstJournal(data).created_on : '';
    };

    var firstJournalUser = function(data) {
        return firstJournal(data) ? firstJournal(data).user.name : '';
    };

    var formatMoment = function(date) {
        if (date !== '') {
            //return moment(date).format("D MMMM YYYY, hh:mm");
            return moment(date).format("YY/MM/DD ddd HH:mm");
            //return new Date(date);
        }
        else {
            return '';
        }
    };

    var diffMoment = function(date, refDate) {
        //var momentDate = moment(date);
        if (date !== '') {
            //var diff =  momentDate.diff( refDate, 'hours', true);
            var diff =  date.diff( refDate, 'hours', true);
            //var diff = date - refDate;
            var diffRound = Math.round(diff * 100) / 100;
            /*
             *console.groupCollapsed("diffRound : ", diffRound);
             *console.log("diff : ", diff);
             * //console.log("momentDate : ", momentDate);
             *console.log("date : ", date);
             *console.log("refDate : ", refDate);
             *console.groupEnd();
             */
            return diffRound.toString().replace('.', ',');
        }
        else {
            return '';
        }
    };

    var setMoment = function(date) {
        if (date !== '') {
            return moment(date);
        }
        else {
            return date;
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

    publicAccess.issue = function (data) {
        var $extract = $('#extract tbody');
        //var loopCount = datas.length;
        moment.lang('fr');
        var dateDemande = formatMoment(data.created_on);
        //var refDate = new Date(data.created_on);

        var refMoment = moment(data.created_on);
        //var refMoment = dateDemande;

        //var dateFirstPost = new Date (firstJournalDate(data));
        var momentFirstPost = setMoment(firstJournalDate(data));
        var momentAValider = setMoment(firstStatus(data, 'aValider'));
        var momentLivre = setMoment(firstStatus(data, 'livre'));
        var momentALivrer = setMoment(firstStatus(data, 'aLivrer'));
        var momentFerme = setMoment(firstStatus(data, 'ferme'));

        var dateFirstPost = formatMoment(firstJournalDate(data));
        var dateAValider = formatMoment(firstStatus(data, 'aValider'));
        var dateLivre = formatMoment(firstStatus(data, 'livre'));
        var dateALivrer = formatMoment(firstStatus(data, 'aLivrer'));
        var dateFerme = formatMoment(firstStatus(data, 'ferme'));

        //var delaiDemande = diffMoment(dateDemande, refDate);
        var delaiFirstPost = diffMoment(momentFirstPost, refMoment);
        var delaiAValider = diffMoment(momentAValider, refMoment);
        var delaiLivre = diffMoment(momentLivre, refMoment);
        var delaiALivrer = diffMoment(momentALivrer, refMoment);
        var delaiFerme = diffMoment(momentFerme, refMoment);

        var issueHtml = ich.issue({
            nomSousProjet: data.project.name,
            numTache: data.id,
            nomTache: data.subject,
            userDateDemande: data.author.name,
            userDateFirstPost: firstJournalUser(data),

            dateDemande: dateDemande,
            dateFirstPost: dateFirstPost,
            dateAValider: dateAValider,
            dateLivre: dateLivre,
            dateALivrer: dateALivrer,
            dateFerme: dateFerme,

            //delaiDemande: delaiDemande,
            delaiFirstPost: delaiFirstPost,
            delaiAValider: delaiAValider,
            delaiLivre: delaiLivre,
            delaiALivrer: delaiALivrer,
            delaiFerme: delaiFerme,
            time: sumTimeEntry(data)
        });
        $extract.append($(issueHtml));
    };

    return publicAccess;
}());
