console.log("===> index_controller.js :");
var mongoose = require("mongoose");
var actions = {};
user = mongoose.model('User');
actions.index = function(request,response){
    console.log("===> index_controller.js : index");
    user.find({}, function(err, docs){
        //sys.puts(sys.inspect(users));
        response.render('index',{
            title: 'title',
            description: 'Description',
            author: 'Ahthor',
            results :  docs,
            total : docs.length
        });
    });
};

module.exports = actions;
