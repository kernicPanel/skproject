
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
            socket.emit('redmineExtract::sync', function (data) {
              console.log(data);
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
            socket.emit('redmineExtract::getIssues', function(err, datas) {
                var issuesHtml = [];

                console.log("err : ", err);
                console.log("datas[0] : ", datas[0]);
                var loopCount = datas.length;
                for (var i = 0; i < loopCount; i++) {
                    var data = datas[i];

                    //console.log("data : ", data);

                    var issueHtml = ich.issue({
                        nomSousProjet: data.project,
                        numTache: data.id,
                        nomTache: data.name,
                        dateDemande: data, 
                        userDateDemande: data,
                        dateFirstPost: data,
                        userDateFirstPost: data,
                        time: data,
                        dateAValider: data,
                        dateLivre: data,
                        dateALivrer: data,
                        dateFerme: data
                    });

                    issuesHtml = issuesHtml.concat(issueHtml);
                    //console.log("issueHtml : ", issueHtml);
                    $extract.append(issueHtml);

                }
                delete loopCount;
                console.log("$extract : ", $extract);
                glob = issuesHtml;
                test = $extract;
                //$extract.after(issuesHtml);
            });
        });


        socket.on('log', function(data){
            console.log("node log : ", data);
        });
    });
  }
};


$(function() {
    app.init();

});
