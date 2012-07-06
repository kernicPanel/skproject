
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

        socket.emit('redmineExtract::sync', function (data) {
          console.log(data);
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

/*
 *        socket.emit('redmineExtract::getIssues', function(err, datas) {
 *            var issuesHtml = [];
 *            var $extract = $('#extract tr');
 *            console.log("err : ", err);
 *            console.log("data : ", data);
 *            var loopCount = datas.length;
 *            for (var i = 0; i < loopCount; i++) {
 *                var data = datas[i];
 *
 *                console.log("data : ", data);
 *
 *                var issueHtml = ich.issue({
 *                    nomSousProjet: data.project.name,
 *                    numTache: data,
 *                    nomTache: data,
 *                    dateDemande: data, 
 *                    userDateDemande: data,
 *                    dateFirstPost: data,
 *                    userDateFirstPost: data,
 *                    time: data,
 *                    dateAValider: data,
 *                    dateLivre: data,
 *                    dateALivrer: data,
 *                    dateFerme: data
 *                });
 *
 *                issuesHtml = issuesHtml.concat(issueHtml);
 *                //console.log("issueHtml : ", issueHtml);
 *                $extract.after(issueHtml);
 *
 *            }
 *            delete loopCount;
 *            console.log("$extract : ", $extract);
 *            glob = issuesHtml;
 *            test = $extract;
 *            //$extract.after(issuesHtml);
 *        });
 */

        socket.on('log', function(data){
            console.log("data : ", data);
        });
    });
  }
};


$(function() {
    app.init();

});
