var peruskartta = {
  map: undefined,
  marker: undefined,
  circle: undefined,
  defaultLocation: new L.LatLng(60.2275,24.9335),
  panned: false,
  
  initialize: function() {
    // initialize the map on the "map" div
    this.map = new L.Map('map');

    var tileurl = 'http://tiles.kartat.kapsi.fi/peruskartta/{z}/{x}/{y}.jpg';
    var basemap = new L.TileLayer(tileurl, {
        attribution: 'Map data &copy; <a href="http://www.maanmittauslaitos.fi">Maanmittauslaitos</a>, tile service by <a href="http://kartat.kapsi.fi">Kapsi</a>&nbsp;&nbsp;',
        scheme: 'tms',
        errorTileUrl: 'notfound.png'
    });

    var center = this.defaultLocation;
    // add the CloudMade layer to the map set the view to a given center and zoom
    this.map.addLayer(basemap).setView(center, 7);

    // create a marker in the given location and add it to the map
    this.marker = new L.Marker(center);
    this.circle = new L.Circle(center, 100, {weight: 2});
    this.map.addLayer(this.marker);
    this.map.addLayer(this.circle);
    
    // observe moving to disable auto pan to location if user has moved the map
    this.map.on('movestart', function(e) {
      this.panned = true;
    }, this);
    
    window.setInterval(window.proxy(this, this.updateLocation), 30000);
    this.updateLocation();
    
  },
  isInLocation: function(latlng) {
    var center = this.map.getCenter();
    if (center.equals(latlng)) {
      return true;
    }
    
    return false;
  },
  setLocation: function(pos, accuracy) {
    if (this.marker) {
      this.marker.setLatLng(pos);
      
      if (!this.circle) {
        this.circle = new L.Circle(pos, accuracy);
        this.map.addLayer(this.circle);
      }
      
      this.circle.setLatLng(pos);
      this.circle.setRadius(accuracy);
      
    } else {
      this.marker = new L.Marker(pos);
      this.map.addLayer(this.marker);
    }
    
    // if not panned by user, pan to own location 
    if (!this.panned) {
      this.map.panTo(pos);
    }
  },
  updateLocation: function() {
    navigator.geolocation.getCurrentPosition(window.proxy(this, function(position) {
      var latlng = new L.LatLng(position.coords.latitude, position.coords.longitude);
      this.setLocation(latlng, position.coords.accuracy);
      
    }), function(error) {
      console.log("Could not get user location");
    },
    {timeout:10000});
  }
}

// modified from spine.js
window.proxy = function(context, func) {
  var _this = context;
  return function() {
    return func.apply(_this, arguments);
  };
};
