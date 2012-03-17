console.log("===> users_controller.js :");
var actions = {};

actions.index = function(request,response){
    console.log("===> users_controller.js : index");
  User.find().all(function(users){
    response.send({
      results :  users,
      total : users.length
    })
  });
};

module.exports = actions;
