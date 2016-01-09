var smoothState;

$(document).ready(function(){
  var options = {
    prefetch: true,
    debug: true,
    onStart: {
      duration: 400,
      render: function (container, url) {
        $("body").animate({
          scrollTop: 0
        }, 400);
        container.addClass("is-exiting");
        smoothState.restartCSSAnimations();
      }
    },
    onReady: {
      duration: 0,
      render: function (container, newContent){
        container.removeClass("is-exiting");
        container.attr("data-slug", $(newContent).filter("meta").data("slug"))
        container.html(newContent);

        var newmenu = $(newContent).filter("meta").data("menu");
        var oldmenu = $("#nav>a.active").data("rooturl");
        if(oldmenu != newmenu){
          $("#nav>a.active").removeClass("active");
          var newmenuitem = $("#nav>a[data-rooturl='" + newmenu + "']");
          if(newmenuitem){
            newmenuitem.addClass("active");
          }
        }
      }
    }
  }
  smoothState = $("#content").smoothState(options).data("smoothState");

  $("#nav>a").click(function(e){
    e.preventDefault();
    var url = $(this).attr("href");
    smoothState.load(url);
  });
});
