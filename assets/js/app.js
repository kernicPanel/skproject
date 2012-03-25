$(function() {
    window.socket = io.connect();

    window.SkUser = Backbone.Model.extend({
        /*
         *defaults: {
         *    name: 'default name'
         *},
         */
        initialize: function() {
            //this.set({name: name});
        }
    });

    //window.skuser = new SkUser('my name');
    var SkUserList = Backbone.Collection.extend({
        model: SkUser
    });


    window.SkUserView = Backbone.View.extend({

        el: $('.content'),
        //... is a list tag.
        //tagName:  "li",

        // Cache the template function for a single item.
        //template: _.template($('#skuser').html()),
        //template: $('#skuser').template(),

        //model: new SkUser(),

        // The TodoView listens for changes to its model, re-rendering.
        initialize: function() {
            _.bindAll(this, 'render', 'addUser', 'appendUser'); // remember: every function that uses 'this' as the current object should be in here

            this.collection = new SkUserList();
            this.collection.bind('add', this.appendUser); // collection event binder

            this.render();
        },

        // Re-render the contents of the todo item.
        render: function() {
            console.log("render : ");
            console.log("this.el : ", this.el);
            /*
             *var html = ich.skuser({
             *    name: this.model.get('name')
             *});
             * //$(this.el).html(this.template(this.model.toJSON()));
             *$(this.el).append(html);
             */
            //this.setText();
            return this;
        },
        addUser: function(skuser) {
            this.collection.add(skuser); // add skUser to collection; view is updated via event 'add'
        },
        appendUser: function(skuser){
            //$('ul', this.el).append("<li>"+skUser.get('part1')+" "+skUser.get('part2')+"</li>");
            var html = ich.skuser({
                name: skuser.get('name')
            });
            //$(this.el).html(this.template(this.model.toJSON()));
            $(this.el).append(html);
        }
    });

    window.skuserView = new SkUserView();

    /*
     *var SkUser = Backbone.Model.extend({
     *    defaults: {
     *        part1: 'hello',
     *        part2: 'world'
     *    }
     *});
     */

/*
 *    var SkUserList = Backbone.Collection.extend({
 *        model: SkUser
 *    });
 *
 *    var SkUserView = Backbone.View.extend({
 *        el: $('.content'),
 *        events: {
 *            'click button#add': 'addItem'
 *        },
 *        initialize: function(){
 *            _.bindAll(this, 'render', 'addItem', 'appendItem'); // remember: every function that uses 'this' as the current object should be in here
 *
 *            this.collection = new SkUserList();
 *            this.collection.bind('add', this.appendItem); // collection event binder
 *
 *            this.counter = 0;
 *            this.render();      
 *        },
 *        render: function(){
 *            var self = this;      
 *            $(this.el).append("<button id='add'>Add list skUser</button>");
 *            $(this.el).append("<ul></ul>");
 *            _(this.collection.models).each(function(skUser){ // in case collection is not empty
 *                self.appendItem(skUser);
 *            }, this);
 *        },
 *        addItem: function(skUser){
 *            this.counter++;
 *            //var skUser = new SkUser();
 *            skUser.set({
 *                part2: skUser.get('part2') + this.counter // modify skUser defaults
 *            });
 *            this.collection.add(skUser); // add skUser to collection; view is updated via event 'add'
 *        },
 *        appendItem: function(skUser){
 *            $('ul', this.el).append("<li>"+skUser.get('part1')+" "+skUser.get('part2')+"</li>");
 *        }
 *    });
 *    var skUserView = new SkUserView();
 */

});
