// utils is a collection of often used methods
//
// Documentation available at https://github.com/Limepark/common/tree/master/google-translate-integration.
//
// Copyright (C) 2013 Limepark AB

var lp = (function (exports, $) {
  var utils = exports.utils = exports.utils || {};

  utils.isOnlineMode = function () {
    return window.self === window.top;
  };

  return exports;
}(lp || {}, jQuery));

// device-hosts - Copyright (C) 2013 Limepark AB
// Documentation: https://github.com/Limepark/common/tree/master/device-hosts

(function(exports, $) {
	exports.deviceHosts = function (options) {
		options = $.extend({
			domain: null,
			path: '/',
			hosts: {},
			cookieName: 'deviceMode',
			expirationTime: 30 * 24 * 60 * 60 * 1000,
			updateOnStart: false
		}, options);

		// Correct domain name by prepeding dot
		if (options.domain && options.domain.length > 1)
			options.domain = options.domain.substring(0, 1) == '.' ? options.domain : '.' + options.domain;

		var get, set, clear, cookie, toggle, update;

		// Get current host according to hostname
		get = function () {
			var mode = null;
			$.each(options.hosts, function (name, hostname) {
				if (hostname == window.location.hostname) mode = name;
			});
			return mode;
		};

		// Set current host
		set = function (mode) {
			if (options.hosts[mode]) {
				document.cookie = encodeURIComponent(options.cookieName) + '=' + encodeURIComponent(mode) + 
				';expires=' + new Date(new Date().getTime() + options.expirationTime).toUTCString() + 
				';domain=' + options.domain + 
				';path=' + options.path;

				if (window.location.hostname != options.hosts[mode])
					window.location.href = window.location.href.replace(window.location.hostname, options.hosts[mode]);

				return true;
			}
			else return false;
		};

		// Clear cookie
		clear = function () {
			document.cookie = encodeURIComponent(options.cookieName) + '=deleted; expires=' + new Date(new Date().getTime() - 1000).toUTCString();
		};

		// Get cookie value
		cookie = function () {
			var cookies, match;
			cookies = {};

			$(document.cookie.split(';')).each(function (index, value) {
				match = value.trim().match(/^([^=]+)=(.+)$/);
				if (match && match.length == 3) cookies[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
			});

			return cookies[options.cookieName];
		};

		toggle = function () {
			var mode = null;
			$.each(options.hosts, function (name, hostname) {
				if (window.location.hostname != hostname) mode = name;
			});
			if (mode) return set(mode);
			else return false;
		};

		update = function (mode) {
			return set(cookie());
		};

		if (options.updateOnStart) update();

		// Privileged
		this.get = get;
		this.set = set;
		this.clear = clear;
		this.cookie = cookie;
		this.toggle = toggle;
		this.update = update;
	};
}(lp, jQuery));