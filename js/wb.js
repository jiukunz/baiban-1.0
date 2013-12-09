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

    events: {
      "submit #goto-board" : "gotoBoard"
    },
    
    initialize: function() {
       
    },

    gotoBoard: function(e) {
      e.preventDefault();
      Parse.history.navigate($("input[name=board-name]").val(), true);
    },

    render: function() {
      $(this.el).html(this.template());
      $('input').focus();
    },
    destroy: function() {
      $(this.el).html("");
    }
  });

  var typingTimer;
  var doneTypingInterval = 7000;
  var prevContnent = $('#content').html();

  WbView = Parse.View.extend({

    tagName:  "article",

    template: _.template($('#white-board-template').html()),

    events: {
      "keyup #content"       : "keyup",
      "keydown #content"    : "keydown",
      "click #update" : "update"
      
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
      $('#white-board h1').text(decodeURIComponent(this.boardId));
      query.find({
        success: function(results) {
          if(results.length !== 0){
            var wb = results[0];
            self.$("#content").html(wb.get("content"));
          }
          
          new Pen({
              editor: document.querySelector('#content'),
              debug: true
            }).rebuild();
        }
      });
    },

    keyup: function(){
        var self = this;
        clearTimeout(typingTimer);
        typingTimer = setTimeout(function(){
            if( prevContnent !== $('#content').html())
              self.update();
          }, doneTypingInterval);
      },

    keydown: function(){
        clearTimeout(typingTimer);
      },

    update: function() {
      var self = this;
      query.equalTo("boardId", self.boardId);
      query.find({
        success: function(results) {
          if(results.length === 0){
            var wb = new Wb();
            wb.save({"boardId":self.boardId, "content": self.$("article").html()},{
              success: function() {
                  prevContnent = $("#content").html();
                  $(".alert-success").show();
                  setTimeout(function() { $(".alert-success").hide(); }, 2000);
                }
            });
          } else {
            results[0].save(null, {
              success: function(wb) {
                  prevContnent = $("#content").html();
                  $(".alert-success").show();
                  setTimeout(function() { $(".alert-success").hide();},2000);
                  wb.set("content", self.$("article").html());
                  wb.save();
                },
              error: function(wb, error) {
                console.log(error);
              }
            });
          }
        }
      });
    }
  });

  var guideView = new GuideView({el: $('.guide')});
  var wbView = new WbView({el: $('.white-board')});


  var AppRouter = Parse.Router.extend({
    routes: {
      ":boardId": "openHouse",
      "": "defaultRoute"
    },

    openHouse: function(boardId) {
      guideView.destroy();
      wbView.boardId = boardId;
      wbView.render();
    },

    defaultRoute: function() {
      guideView.render();
    }
  });


  new AppRouter();
  
  Parse.history.start();
});
