// An example Parse.js Backbone application based on the todo app by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses Parse to persist
// the todo items and provide user authentication and sessions.

$(function() {

  Parse.$ = jQuery;

  // Initialize Parse with your Parse application javascript keys
  Parse.initialize("4CeVrA0hth3HLew7yEGXE8Ms2L003vsfc9XRGfys",
                   "hwZbAeWsB03GDc0GjhvyVIvOh1UeXMb41XnGM0Mh");

  // Todo Model
  // ----------
  var Wb = Parse.Object.extend("Wb");
  var query = new Parse.Query(Wb);
  

  var GuideView = Parse.View.extend({
    tagName: "div",
    template: _.template($('#guide-template').html()),

    initialize: function() {
    },

    render: function() {
      $(this.el).html(this.template());
    },
    destroy: function() {
      $(this.el).html("");
    }
  });

  var WbView = Parse.View.extend({

    tagName:  "article",

    template: _.template($('#white-board-template').html()),

    events: {
      "click #get"       : "get",
      "click #update"    : "update",
    },

    initialize: function() {
      
    },

    render: function() {
      $(this.el).html(this.template());
      this.get();
    },

    get: function() {
      var self = this;
      query.equalTo("boardId", this.boardId);
      query.find({
        success: function(results) {
          if(results.length !== 0){
            var wb = results[0];
            self.$("article").html(wb.get("content"));
          }
        },
        error: function(object, error) {
        }
      });
    },

    update: function() {
      var self = this;
      query.equalTo("boardId", self.boardId);
      query.find({
        success: function(results) {
          if(results.length === 0){
            var wb = new Wb();
            wb.save({"boardId":self.boardId, "content": self.$("article").html()},{
              success: function(wb) {
                  $(".alert-success").show();
                  setTimeout(function() { $(".alert-success").hide(); }, 2000);
                 },
              error: function(wb, error) {
              }
            });
          } else {
            results[0].save(null, {
              success: function(wb) {

                  $(".alert-success").show();
                  setTimeout(function() { $(".alert-success").hide();},2000);
                wb.set("content", self.$("article").html())
                wb.save();
              },
              error: function(wb, error) {
                console.log(error);
              }
            });
          }
        },
        error: function(error) {
        }
      });
    }
  });


  var AppRouter = Parse.Router.extend({
    routes: {
      ":boardId": "openHouse",
      "": "defaultRoute"
    },

    initialize: function(options) {
    },

    openHouse: function(boardId) {
      guideView.destroy();
      wbView.boardId = boardId;
      wbView.render();
    },

    defaultRoute: function(actions) {
      guideView.render();
    }
  });


  new AppRouter;
  var guideView = new GuideView({el: $('.guide')});
  var wbView = new WbView({el: $('.white-board')});

  Parse.history.start();
});
