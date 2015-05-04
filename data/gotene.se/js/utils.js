// utils is a collection of often used methods
//
// Documentation available at https://github.com/Limepark/common/tree/master/utils.
//
// Copyright (C) 2013 Limepark AB
var lp = (function (exports, $) {
  var utils = exports.utils = exports.utils || {};

  utils.isOnlineMode = function () {
    return window.self === window.top;
  };

  return exports;
}(lp || {}, jQuery));