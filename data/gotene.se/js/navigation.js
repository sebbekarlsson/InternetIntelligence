(function ($) {
  // For flicker free JavaScript specific styling.
  $('html').addClass('js');

  var initializeStickyMenu = function () {
     //var menu = $('#svid10_476402fa13e3b859cf026e1d');
    var menu = $('.sticky-menu-container');
    var top = menu.offset().top - parseFloat(menu.css('margin-top').replace(/auto/, 0));

    menu.parent().css('height', menu.parent().height());
    
    $(window).scroll(function (event) {
      var y = $(this).scrollTop();

      if (document.documentElement.clientWidth > 480 && y >= top) {
        menu.addClass('lp-topmenu-stick');
      } else {
        menu.removeClass('lp-topmenu-stick');
      }
    });
  };


  $(window).load(function () {
    
    if ($(window).width()>1000 && lp.utils.isOnlineMode()) {
      initializeStickyMenu();
    }
  });

})($svjq);
