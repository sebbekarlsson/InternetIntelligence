// Google translate
//
// Documentation available at https://github.com/Limepark/common/tree/master/google-translate-integration.
//
// Copyright (C) 2013 Limepark AB
(function($, utils) {
  $.fn.googleTranslate = function(options) {
    var parent, modal;

    if (utils.isOnlineMode()) {
      $('body').append('<div id="google-translate-modal"><div id="google-translate-modal-close"><a href="#">Close</a></div><div id="google_translate_element"></div><p>Use Google to translate the web site. We take no responsibility for the accuracy of the translation.</p></div>');
      $.getScript('//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit');

      // Show hide the modal window when the user clicks a link that goes to
      // translate.google*
      $(this).click(function(e) {
        e.preventDefault();

        if (!$('.goog-te-banner-frame').is(":visible")) {
          parent = $(this).parent();
          modal = $('#google-translate-modal');

          // Calculate position using the parent item and add the div last to work around overflow:hidden
          modal.css('top', parent.offset().top + parent.outerHeight());
          modal.css('left', parent.offset().left);
          $('body').append(modal);
          modal.show();
        }

        // Close the translate modal window when the user chooses language
        $('iframe.goog-te-menu-frame').contents().find('a').click(function(e) {
          $('#google-translate-modal').hide();
        });
      });

      $('#google-translate-modal-close').click(function() {
        $('#google-translate-modal').hide();
      });
    }
  };

  // The following is Google's code for website translating.
  // We are wrapping their div in our own #google-translate-modal though.
  // Customize your own at: http://translate.google.com/translate_tools?hl=en
  // We add it to window to make it global
  window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({
      pageLanguage: 'sv',
      autoDisplay: false,
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE
    }, 'google_translate_element');
  }
})(jQuery, lp.utils);

(function ($) {

  $(function () {
    $('a[href^="http://translate.google"]').googleTranslate();
  });
  
}(jQuery));