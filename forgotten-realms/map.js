
/* Variables */

var factorx = 0.0625;
var factory = 0.0625;
var mapheight = 4096;
var mapwidth = 4096;
var mapMinZoom = 1;
var mapMaxZoom = 4;
var apiRoot = "http://mcrpc-server.petervertesi.com";
var mapName = "forgotten-realms";

/* Configure custom CRS */

L.CRS.custom = L.extend({}, L.CRS.Simple, {
  projection: L.Projection.LonLat,
  transformation: new L.Transformation(factorx, 0, -factory, 0),

  scale: function(zoom) {
    return Math.pow(2, zoom);
  },

  zoom: function(scale) {
    return Math.log(scale) / Math.LN2;
  },

  distance: function(latlng1, latlng2) {
    var dx = latlng2.lng - latlng1.lng,
		dy = latlng2.lat - latlng1.lat;

    return Math.sqrt(dx * dx + dy * dy);
  },
  infinite: true
});

/* Create map and layer */

var map = L.map('map', {
	crs: L.CRS.custom
}).setView([-1942, 1294], 3);

// Set boundaries

var sw = map.unproject([0, mapheight], 4);  // Level 4, because this is the level where meters-per-pixel is exactly 1
var ne = map.unproject([mapwidth, 0], 4);
var layerbounds = new L.LatLngBounds(sw, ne);
map.setMaxBounds(layerbounds);

// Get initial zoom level

var currentZoomLevel = map.getZoom();

// Add map tile layer

L.tileLayer('tiles/{z}-{x}-{y}.jpg', {
	bounds: layerbounds,
	tileSize: L.point(256,256),
	tolerance: 0.8,
	noWrap: true,
	minZoom: mapMinZoom,
	maxZoom: mapMaxZoom,
	tms: true,
	attribution: 'Peter Vertesi, 2020'
}).addTo(map);

// Show or hide markers based on zoom level

function AdjustZoomLevel() {
	currentZoomLevel = map.getZoom();
}
AdjustZoomLevel();
map.on("zoomend", () => {
	AdjustZoomLevel();
	if (currentZoomLevel >= 3) {
		map.addLayer(geoJsonLayerReference);
	} else {
		map.removeLayer(geoJsonLayerReference);
	}
})

// Add Marker

var testPopup = L.popup();
map.on('contextmenu', (e) => {
	var coordinates = [Math.floor(e.latlng.lng),Math.floor(-e.latlng.lat)];
	testPopup.setLatLng(e.latlng);
	testPopup.setContent(`<h3>Add Marker<h3><h4>Current coordinates: ${coordinates}<h4><p><form onSubmit="return false"><label for="name">Name:</label><br><input type="text" id="name" name="name"><br><label for="url">Url:</label><br><input type="text" id="url" name="url"><br><label for="desc">Description:</label><br><textarea type="text" id="desc" rows="4" style="width: 96%;" name="desc"></textarea><input hidden type="text" id="coords" value="${coordinates}"><br><br><button type="submit" onClick="submitGeoJsonData(); dragMarker.closePopup();">Save</button></form></p>`);
	testPopup.openOn(map);
})

// GeoJSON

var geoJsonLayerReference = L.geoJSON();
var apiUrl = `${apiRoot}/api/geojson`;

var queryUrl = `${apiUrl}?map=${mapName}`;
httpGetAsync(queryUrl, (response) => {
	var geoJsonData = JSON.parse(response).results;
	var geoJsonLayer = L.geoJSON(false, {
		onEachFeature: createGeoJsonPopup,
		coordsToLatLng: convertGeoJsonCoordinates
	});
	if (currentZoomLevel >= 3) {
		geoJsonLayer.addTo(map);
	}
	geoJsonLayer.addData(geoJsonData);
	geoJsonLayerReference = geoJsonLayer;
});

/* Utility functions */

// Make async HTTP GET request
function httpGetAsync(url, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.response);
    }
    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.send(null);
}

// Make async HTTP POST request
function httpPostAsync(url, body, callback)
{
	var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", url, true); // true for asynchronous
	xmlHttp.setRequestHeader("Content-type","application/json");
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && (xmlHttp.status == 200 || xmlHttp.status == 201))
            callback(xmlHttp.response);
    }
    xmlHttp.send(JSON.stringify(body));
}

// Bind popups based on GeoJSON properties data
function createGeoJsonPopup(feature, layer)
{
	var popupData = `<h3><a href="${feature.properties.url}" target="_blank" rel="noopener noreferrer">${feature.properties.name}</a></h3><div style="white-space: pre-line; width: 15rem;">${feature.properties.desc}</div>`;
	layer.bindPopup(popupData);
}

// Convert geoJSON coordinates to correct LatLng values
function convertGeoJsonCoordinates(coords)
{
	return new L.LatLng(-coords[1], coords[0], coords[2]);
}

// Create new pin
function submitGeoJsonData() {
	//Compile form data to correct format
	var coordinates = document.getElementById("coords").value.split(",");
	var data = {
		geometry: {
			type: "Point",
			coordinates: [parseInt(coordinates[0]),parseInt(coordinates[1])]
		},
		properties: {
			map: mapName,
			name: document.getElementById("name").value,
			url: document.getElementById("url").value,
			desc: `<p>${document.getElementById("desc").value}</p>`,
			markerOptions: {}
		}
	};
	//Make POST request to API
	var token = prompt("Please enter the API token");
	var postUrl = `${apiUrl}?token=${token}`;
	httpPostAsync(postUrl, data, (response) => {
		var message = JSON.parse(response).message;
		window.alert(message);
		window.location.reload(true);
	})
}

// Move draggable marker to right-click position
function MoveDraggable(pos) {
	
}