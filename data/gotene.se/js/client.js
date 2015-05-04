// Copyright (C) 2013 Limepark AB

// console shim, if the browser doesn't support console, do nothing
(function () {
    var f = function () {};
    if (!window.console) {
        window.console = {
            log:f, info:f, warn:f, debug:f, error:f
        };
    }
}());

var lp = (function(exports, $) {
  var googleMaps = exports.googleMaps = exports.googleMaps || {};

  // TODO: naming
  // TODO: look over public/private, now everything is public (within the module), not a big deal but we could look it over
  // TODO: more refactoring, eg. Map.initMarkers and Map.updateMarkers could be merged, EditorUI could probably be split up since it's large
  // TODO: look over dependencies, many functions/accessors are called on objects inside other objects

  // Application is the main entry point, coordinates the application
  function Application(canvasId, canvasProperties, markers, remoteNodesURL, filterLinksSelector) {
    this.canvasId = canvasId;
    this.canvasProperties = canvasProperties;
    this.markers = markers;
    this.remoteNodesURL = remoteNodesURL;
    this.filterLinksSelector = filterLinksSelector;

    this.map = null;
    this.visitorUI = null;
    this.editorUI = null;

    google.maps.event.addDomListener(window, 'load', this.initialize.bind(this));
  }

  Application.prototype.initialize = function() {
    this.map = new Map(this.canvasId, this.canvasProperties, this.markers);
    if (this.remoteNodesURL && this.filterLinksSelector) {
      this.visitorUI = new VisitorUI(this.map, this.canvasProperties, this.remoteNodesURL, this.filterLinksSelector);
      this.editorUI = new EditorUI(this.map, this.canvasProperties, this.remoteNodesURL);
    }
  };

  var SearchResult = function(themap) {
    var theMap = themap;
    this.getMap = function() {return theMap};
    
  }
  SearchResult.prototype.update = function(markers) {
    $sr = $('ol#searchResult');
    
    $sr.html("");
    var theMap = this.getMap();
    var searchResultClicked = function() {
      $element = $(this);
      console.log(theMap);
      google.maps.event.trigger(theMap.realMarkers[$element.index()], 'click');
    }
    for (var i = 0; i < markers.length; i++) {
      item = $("<li>" + (i+1) + ': ' + markers[i].mapTitle + "</li>").click(searchResultClicked);
      $sr.append(item);
    }
  }
  // Wrapper for the google maps object
  Map = function(canvasId, canvasProperties, markers) {
    this.searchResult = new SearchResult(this);
    this.canvasId = canvasId;
    this.canvasProperties = canvasProperties;
    this.markers = markers;

    this.map = null;
    this.directions = null;
    this.realMarkers = [];
    this.infoWindow = new google.maps.InfoWindow();

    if (typeof canvasId == 'undefined') {
        console.error("MapCanvasId is not defined");
      } else if (typeof canvasProperties == 'undefined') {
        console.error("The maps canvas properties is not defined");
      } else {
        if ((typeof canvasProperties.center.a !== "undefined") && (typeof canvasProperties.center.b !== "undefined")) {
          var latLng = new google.maps.LatLng(canvasProperties.center.a, canvasProperties.center.b);
        }
        else if ((typeof canvasProperties.center.b !== "undefined") && (typeof canvasProperties.center.c !== "undefined")) {
          var latLng = new google.maps.LatLng(canvasProperties.center.b, canvasProperties.center.c);
        }

        var mapConfiguration = {
          zoom: canvasProperties.mapZoomLevel,
          center: latLng,
          mapTypeId: canvasProperties.mapTypeId,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            position: google.maps.ControlPosition.TOP_RIGHT
          }
        };

        this.map = new google.maps.Map(document.getElementById(canvasId), mapConfiguration);
      }

      google.maps.event.addListenerOnce(this.map, 'tilesloaded', this.initMarkers.bind(this));
  }

  Map.prototype.getGoogleMap = function() {
    return this.map;
  };

  Map.prototype.initMarkers = function() {
    if (this.markers != "undefined" && this.canvasProperties.mapType == "collected" && this.markers.length > 0) {

      var connectedMarkers = [];
      var bounds = new google.maps.LatLngBounds();
      for (var i = 0; i < this.markers.length; i++) {
        var poi = this.markers[i];
        if ((typeof poi.position.a !== "undefined") && (typeof poi.position.b !== "undefined")) {
          var latLng = new google.maps.LatLng(poi.position.a, poi.position.b);
        }
        else if ((typeof poi.position.b !== "undefined") && (typeof poi.position.c !== "undefined")) {
          var latLng = new google.maps.LatLng(poi.position.b, poi.position.c);
        }

        var markerSettings = {
          position: latLng,
          title: poi.mapTitle,
          map: this.getGoogleMap()
        };

        if (poi.mapObjectIcon != "") {
          markerSettings['icon'] = poi.mapObjectIcon;
        }

        var marker = new google.maps.Marker(markerSettings);
        this.attachInfoWindow(marker, i);

        this.realMarkers.push(marker);
        if (poi.connect) {
          connectedMarkers.push(marker);
        }
        if (this.canvasProperties.customPredefinedSearch) {
          if (!bounds.contains(latLng)) {
            bounds.extend(latLng);
          }
        }
      }

      if (connectedMarkers.length > 1) {
        this.directions = new Directions(this, connectedMarkers);
      }

      if (this.canvasProperties.customPredefinedSearch) {
        this.getGoogleMap().fitBounds(bounds);
      }
    } else if (this.canvasProperties.mapType == "object") {
      if (typeof this.canvasProperties.markers === "undefined") {
        var latLng = new google.maps.LatLng(this.getGoogleMap().getCenter().lat(), this.getGoogleMap().getCenter().lng());
        this.realMarkers.push(new google.maps.Marker({
          position: latLng,
          title: "Kartmarkör",
          map: this.getGoogleMap()
        }));
      } else {
        for (var i = 0; i < this.canvasProperties.markers.length; i++) {
          var poi = this.canvasProperties.markers[i];
          if ((typeof poi.position.a !== "undefined") && (typeof poi.position.b !== "undefined")) {
            latLng = new google.maps.LatLng(poi.position.a, poi.position.b);
          }
          else if ((typeof poi.position.b !== "undefined") && (typeof poi.position.c !== "undefined")) {
            latLng = new google.maps.LatLng(poi.position.b, poi.position.c);
          }

          this.realMarkers.push(new google.maps.Marker({
            position: latLng,
            title: poi.geocodeAddress,
            map: this.getGoogleMap()
          }));
        }
      }
    }
  };

  Map.prototype.attachInfoWindow = function(marker,index) {
    var self = this;
    google.maps.event.addListener(marker, 'click', function() {
       
      content = "<h2>" + self.markers[index].mapTitle + "</h2><br />" + self.markers[index].markerInfo;

      self.infoWindow.close();
      self.infoWindow.setContent(content);
      self.infoWindow.open(self.getGoogleMap(), marker);
    });
  };

  Map.prototype.updateMarkers = function(markers) {
    var connectedMarkers = [];
    this.markers = markers
    this.searchResult.update(this.markers);
    this.realMarkers.length = 0;
    for (var i = 0; i < this.realMarkers.length; i++) {
      this.realMarkers[i].setMap(null);
    }

    if (this.directions != null){
      this.directions.reset();
    }

    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++) {
      var poi = markers[i];
      if ((typeof poi.position.a !== "undefined") && (typeof poi.position.b !== "undefined")) {
        var latLng = new google.maps.LatLng(poi.position.a, poi.position.b);
      }
      else if ((typeof poi.position.b !== "undefined") && (typeof poi.position.c !== "undefined")) {
        var latLng = new google.maps.LatLng(poi.position.b, poi.position.c);
      }

      var markerSettings = {
        position: latLng,
        title: poi.mapTitle,
        map: this.getGoogleMap()
      };

      if (poi.mapObjectIcon != "") {
        markerSettings['icon'] = poi.mapObjectIcon;
      }

      var marker = new google.maps.Marker(markerSettings);

      this.attachInfoWindow(marker,i);

      this.realMarkers.push(marker);
      if (poi.connect) {
        connectedMarkers.push(marker);
      }
      if (!bounds.contains(latLng)) {
        bounds.extend(latLng);
      }
    }

    if (connectedMarkers.length > 1) {
      this.directions = new Directions(this, connectedMarkers);
    }

    this.getGoogleMap().fitBounds(bounds);
    this.getGoogleMap().setCenter(bounds.getCenter());
  };

  Map.prototype.moveMarker = function(position) {
    this.realMarkers[0].setPosition(position);
  };

  // Contains logic to draw routes on the map
  function Directions(map, connectedMarkers) {
    this.googleMap = map.getGoogleMap();
    this.connectedMarkers = connectedMarkers;

    this.path = null;
    this.directionsService = new google.maps.DirectionsService();

    var directionStart = this.connectedMarkers[0].getPosition();
    var wayPoints = [];
    for (var i = 1; i < (this.connectedMarkers.length - 1); i++) {
      wayPoints.push({ location: this.connectedMarkers[i].getPosition(), stopover: true });
    }
    var directionEnd = this.connectedMarkers[(connectedMarkers.length - 1)].getPosition();

    var request = {
      origin:directionStart,
      destination:directionEnd,
      provideRouteAlternatives: false,
      travelMode: google.maps.DirectionsTravelMode.WALKING,
      unitSystem: google.maps.DirectionsUnitSystem.METRIC
    };
    if (wayPoints.length > 0){
      request.waypoints = wayPoints;
    }

    this.directionsService.route(request, this.drawRoutebind(this));
  };

  Directions.prototype.drawRoute = function(directionResult, status) {
    var routeLogContainer = $("#routeLog"); // Ui?
    var routeLogList = $("<ol></ol>").appendTo(routeLogContainer);

    var directionCoordinates = [];

    for (var routeIter = 0; routeIter < directionResult.routes.length; routeIter++) {
      var route = directionResult.routes[routeIter];
      for (var legIter = 0; legIter < route.legs.length; legIter++) {
        var leg = route.legs[legIter];
        for (var stepIter = 0; stepIter < leg.steps.length; stepIter++) {
          var step = leg.steps[stepIter];
          directionCoordinates.push(step.start_point);
          for (var tStepIter = 1; tStepIter < (step.lat_lngs.length - 1); tStepIter++) {
            directionCoordinates.push(step.lat_lngs[tStepIter]);
          }

          if (stepIter == (leg.steps.length - 1)) {
            directionCoordinates.push(step.end_point);
          }
        }
      }
    }

    this.path = new google.maps.Polyline({
      path: directionCoordinates,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    this.path.setMap(this.googleMap);
  };

  Directions.prototype.reset = function() {
    this.path.setMap(null);
  };

  // Responsible for the ui for visitors, can reload markers using a filter
  VisitorUI = function(map, canvasProperties, remoteNodesURL, filterLinksSelector) {
    this.map = map;
    this.canvasProperties = canvasProperties;
    this.remoteNodesURL = remoteNodesURL;
    this.filterLinksSelector = filterLinksSelector;

    $("." + this.filterLinksSelector).click(this.filter.bind(this));
  }

  VisitorUI.prototype.filter = function(event) {
    var elmt = $(event.target);
    var filterValue = elmt.attr("title");
    elmt.addClass("lp-selected-tmp");
    var params = {
      "mapAction": "getNodes",
      "X-Requested-With": "XMLHttpRequest"
    };
    params[this.canvasProperties.mapCategoriesMetadataName] = filterValue;

    $.get(this.remoteNodesURL, params, this.reloadMarkers.bind(this), 'json');

    return false;
  };

  VisitorUI.prototype.reloadMarkers = function(data, textStatus, XMLHttpRequest) {
    if (data.length >0) {
      this.map.infoWindow.close(); // TODO: Remove coupling. closeInfoWindow should be method?
      var markers = data;
      //Handling selected-state, somewhat klumpsy :)
      $(".lp-selected").toggleClass("lp-selected")
      elmt = $(".lp-selected-tmp").toggleClass("lp-selected-tmp").addClass("lp-selected");
      this.map.updateMarkers(markers);
    } else {
       
      console.log('Hittade inget att visa...');
    }
  };

  // Responsible for managing the ui for editors
  // TODO: search for this.map and refactor thar usage
  function EditorUI(map, canvasProperties, remoteNodesURL) {
    this.map = map;
    this.canvasProperties = canvasProperties;
    this.remoteNodesURL = remoteNodesURL;
    this.markerData = {};
    this.addresses = [];
    this.geocoder = new google.maps.Geocoder();

    if (typeof this.canvasProperties.editable !== "undefined" && this.canvasProperties.editable == true) {
      google.maps.event.addListenerOnce(this.map.getGoogleMap(), 'tilesloaded', this.makeEditable.bind(this));
    }
  }

  EditorUI.prototype.saveCompleted = function(data) {
    alert (data.message);
    this.makeMapStale();
  };

  EditorUI.prototype.hideMarkers = function () {
    for (var i = 0; i < this.map.realMarkers.length; i++) { // TODO: remove dependency
      this.map.realMarkers[i].setMap(null);
    }
  };

  EditorUI.prototype.showMarkers = function () {
    for (var i = 0; i < this.map.realMarkers.length;i++) {
      this.map.realMarkers[i].setMap(this.map.getGoogleMap());
    }
  };

  EditorUI.prototype.makeMarkerMovable = function() {
    this.map.realMarkers[0].setDraggable(true);
    this.map.realMarkers[0].setFlat(true);
    this.map.realMarkers[0].setCursor('move');
    google.maps.event.addListener(this.map.realMarkers[0], 'dragend', this.map.setMarkerPosition);
  }

  EditorUI.prototype.makeMarkerStale = function() {
    this.map.realMarkers[0].setDraggable(false);
    this.map.realMarkers[0].setFlat(false);
    this.map.realMarkers[0].setCursor('pointer');
  }

  EditorUI.prototype.makeMapEditable = function() {
    if (this.map.getGoogleMap().controls[google.maps.ControlPosition.TOP].getLength() == 1) {
      this.map.getGoogleMap().controls[google.maps.ControlPosition.TOP].removeAt(0);
    }
    if (this.canvasProperties.mapType == "collected") {
      this.hideMarkers();
    }
    else if (this.canvasProperties.mapType == "object") {
      this.makeMarkerMovable();
    }
    this.addEditOption();
  };

  EditorUI.prototype.makeMapStale = function() {
    if (this.map.getGoogleMap().controls[google.maps.ControlPosition.TOP].getLength() == 1) {
      this.map.getGoogleMap().controls[google.maps.ControlPosition.TOP].removeAt(0);
    }

    $('#' + this.map.canvasId + '_editExt').remove();
    $('#' + this.map.canvasId).removeClass("ubordered");

    if (this.canvasProperties.mapType == "collected") {
      this.showMarkers();
    }
    else if (this.canvasProperties.mapType == "object") {
      this.makeMarkerStale();
    }

    this.makeEditableButton();
  };

  EditorUI.prototype.displayAddressInfo = function(addresses) {
    this.addresses = addresses;

    if (this.addresses.length == 0) {
      this.markerData.geocodeAddress = "";
      $("#" + this.map.canvasId + '_addressInfo').text("Ingen adress funnen");
    } else if (this.addresses.length == 1) {
      var resultA = this.addresses[0];
      this.markerData.geocodeAddress = resultA.formatted_address;

      if(typeof resultA.geometry.location !== "undefined") {
        this.map.moveMarker(resultA.geometry.location);
      }
      if(typeof resultA.geometry.viewport !== "undefined") {
        this.map.getGoogleMap().fitBounds(resultA.geometry.viewport);
      }

      $("#" + this.map.canvasId + '_addressInfo').text(resultA.formatted_address);
    } else if (this.addresses.length > 1) {
      $("#" + this.map.canvasId + '_addressInfo').text("");

      var selectElement = $('<select></select>').change(this.precisionChanged.bind(this)).attr('id', this.map.canvasId + 'addressOption');

      $('<option></option>').attr('value',"").text("Välj precision...").appendTo(selectElement);
      for (var i = 0; i < this.addresses.length; i++) {
        $('<option></option>').attr('value', i).text(this.addresses[i].formatted_address + (i == 0 ? " (förvald)" :'')).appendTo(selectElement);
      }
      selectElement.appendTo($("#" + this.map.canvasId + '_addressInfo'));
    }
  }

  EditorUI.prototype.precisionChanged = function(event) {
    if ($(event.target).val() != "") {
      var resultA = this.addresses[parseInt($(event.target).val())];

      this.markerData.geocodeAddress = resultA.formatted_address;
      if(typeof resultA.geometry.location !== "undefined") {
        this.map.moveMarker(resultA.geometry.location);
      }
      if(typeof resultA.geometry.viewport !== "undefined") {
        this.map.getGoogleMap().fitBounds(resultA.geometry.viewport);
      }
    }
  };

  EditorUI.prototype.geocodePosition = function (pos) {
    this.geocoder.geocode({
      latLng: pos,
      language:'sv',
      'region':'se'
    }, this.displayAddressInfo.bind(this));
  };

  EditorUI.prototype.geocodeAddress = function() {
    var elmt = $('#' + this.map.canvasId + '_lookupAddress');
    var addressToLookUp = elmt.val();

    this.geocoder.geocode({
      'address': addressToLookUp,
      'partialmatch': true,
      'language':'sv',
      'region':'se'
    }, this.displayAddressInfo.bind(this));
  };

  EditorUI.prototype.saveMapView = function() {
    var saveData = {};
    var mBounds = this.map.getGoogleMap().getBounds();
    var msBounds = {};

    saveData.bounds = mBounds;
    saveData.mapZoomLevel = this.map.getGoogleMap().getZoom();
    saveData.mapTypeId = this.map.getGoogleMap().getMapTypeId();
    saveData.center = { "a": this.map.getGoogleMap().getCenter().lat(), "b": this.map.getGoogleMap().getCenter().lng()};

    if (this.canvasProperties.mapType == "object" && this.map.realMarkers.length == 1) {
      var oMarker = {};
      oMarker.position = { "a": this.map.realMarkers[0].getPosition().lat(), "b": this.map.realMarkers[0].getPosition().lng() };
      oMarker.geocodeAddress = this.markerData.geocodeAddress;
      saveData.markers = [];
      saveData.markers.push(oMarker);
    }

    var mapData = JSON.stringify(saveData);
    $.post(this.remoteNodesURL, { "mapAction": "save", mapData: mapData, "X-Requested-With": "XMLHttpRequest" }, this.saveCompleted.bind(this), "json");
  };

  EditorUI.prototype.publishMapView = function() {
    var saveData = {};
    var mBounds = this.map.getGoogleMap().getBounds();
    saveData.bounds = mBounds;
    saveData.mapZoomLevel = this.map.getGoogleMap().getZoom();
    saveData.mapTypeId = this.map.getGoogleMap().getMapTypeId();
    saveData.center = { "a": this.map.getGoogleMap().getCenter().lat(), "b": this.map.getGoogleMap().getCenter().lng() };

    if (this.canvasProperties.mapType == "object" && this.map.realMarkers.length == 1) {
      var oMarker = {};
      oMarker.position = { "a": this.map.realMarkers[0].getPosition().lat(), "b": this.map.realMarkers[0].getPosition().lng() };
      oMarker.geocodeAddress = this.markerData.geocodeAddress;
      saveData.markers = [];
      saveData.markers.push(oMarker);
    }

    var mapData = JSON.stringify(saveData);
    $.post(this.remoteNodesURL, {"mapAction": "savepublish", mapData: mapData, "X-Requested-With": "XMLHttpRequest"}, this.saveCompleted.bind(this), "json");
  };

  EditorUI.prototype.addEditOption = function() {
    var controllerContainer = $("<div></div>").addClass("controllerContainer").get(0);
    var controllerSaveButton = $("<div></div>").addClass("controllerButton").get(0);
    var controllerPublishButton = $("<div></div>").addClass("controllerButton").get(0);
    var controllerAbortButton = $("<div></div>").addClass("controllerButton").get(0);

    if (this.canvasProperties.mapType == 'object' && this.map.realMarkers.length == 1) {
      var searchAddressContainer = $("<div></div>").addClass("controllerContainer").addClass("clearfix").attr('id', this.map.canvasId+'_editExt');

      var controllerAddressField = $("<div></div>").addClass("controllerButton").append($("<input type='text'>").attr('id', this.map.canvasId + '_lookupAddress').addClass("controllerText"));

      var controllerFindAddressButton = $("<div></div>").addClass("controllerButton");
      controllerFindAddressButton.click(this.geocodeAddress.bind(this));

      var controllerFindAddressText = $("<div></div>").addClass("controllerText").text('Hitta address');
      var addressInfo = $("<div></div>").addClass("infoBox").attr('id', this.map.canvasId + '_addressInfo');

      controllerFindAddressButton.append(controllerFindAddressText);
      searchAddressContainer.append(controllerAddressField);
      searchAddressContainer.append(controllerFindAddressButton);
      searchAddressContainer.append(addressInfo);

      $("#" + this.map.canvasId).after(searchAddressContainer);
      $("#" + this.map.canvasId).addClass("ubordered");
    }

    google.maps.event.addDomListener(controllerSaveButton, 'click', this.saveMapView.bind(this));
    google.maps.event.addDomListener(controllerPublishButton, 'click', this.publishMapView.bind(this));
    google.maps.event.addDomListener(controllerAbortButton, 'click', this.makeMapStale.bind(this));

    var controllerSaveText = $("<div></div>").addClass("controllerText").text('Spara Kartvy').get(0);
    var controllerPublishText = $("<div></div>").addClass("controllerText").text('Spara & Publicera Kartvy').get(0);
    var controllerAbortText = $("<div></div>").addClass("controllerText").text('Avbryt').get(0);

    controllerSaveButton.appendChild(controllerSaveText);
    controllerPublishButton.appendChild(controllerPublishText);
    controllerAbortButton.appendChild(controllerAbortText);

    controllerContainer.appendChild(controllerSaveButton);

    if (this.canvasProperties.publishable){
      controllerContainer.appendChild(controllerPublishButton);
    }

    controllerContainer.appendChild(controllerAbortButton);
    controllerContainer.index=1;
    this.map.getGoogleMap().controls[google.maps.ControlPosition.TOP].push(controllerContainer);
  };

  EditorUI.prototype.makeEditableButton = function() {
    var controllerContainer = $("<div></div>").addClass("controllerContainer").get(0);
    var controllerMakeEditableButton = $("<div></div>").addClass("controllerButton").get(0);

    google.maps.event.addDomListener(controllerMakeEditableButton, 'click', this.makeMapEditable.bind(this));

    var controllerMakeEditableText = $("<div></div>").addClass("controllerText").text('Redigera kartinställningar').get(0);

    controllerMakeEditableButton.appendChild(controllerMakeEditableText);

    controllerContainer.appendChild(controllerMakeEditableButton);

    controllerContainer.index=1;

    this.map.getGoogleMap().controls[google.maps.ControlPosition.TOP].push(controllerContainer);
  };

  EditorUI.prototype.setMarkerPosition = function() {
    this.geocodePosition(this.realMarkers[0].getPosition())
  };

  EditorUI.prototype.makeEditable = function () {
    this.makeEditableButton();
  };

  // Only expose Application outside the module
  googleMaps.Application = Application;

  return exports;
})(lp || {}, jQuery);