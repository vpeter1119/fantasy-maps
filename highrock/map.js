// Configuration

var mapMinZoom = 1;
var mapMaxZoom = 4;
var bounds = [[0,0], [-2048,2048]];

// Create map and layer

var map = L.map('map', {
    crs: L.CRS.Simple,
	center: [0,0],
	minZoom: 1,
}).setView(new L.LatLng(-150,100), 1);

var currentZoomLevel = map.getZoom();

L.tileLayer('tiles/{z}-{x}-{y}.jpg', {
	bounds: bounds,
	tolerance: 0.8,
	noWrap: true,
	minZoom: mapMinZoom,
	maxZoom: mapMaxZoom,
	tms: false,
	attribution: 'Peter Vertesi, 2020 | Created with <a href="https://www.wonderdraft.net/" target="_blank" rel="noopener noreferrer">Wonderdraft</a>'
}).addTo(map);

// Adjust zoom level

function AdjustZoomLevel() {
	currentZoomLevel = map.getZoom();
}
AdjustZoomLevel();
map.on("zoomend", () => {
	AdjustZoomLevel();
	if (currentZoomLevel >= 3) {
		map.addLayer(markersLayer);
	} else {
		map.removeLayer(markersLayer);
	}
})

// Markers

var markersLayer = new L.LayerGroup(GetMarkers());
console.warn(markersLayer);

function GetMarkers() {
	var markersArray = [];
	markers.forEach(marker => {
		var pos = [-(marker.position[1]/16),(marker.position[0]/16)];
		console.warn(pos);
		var options = marker.options;
		//options.fillOpacity = 0;
		var newMarker = L.marker(pos, options);
		newMarker.bindPopup(marker.popup.content);
		markersArray.push(newMarker);
	});
	return(markersArray);
}

function FilterMarkers(zoomLevel) {
	return markers.filter(marker => {
		return (marker.zoomLevelMin <= zoomlevel && marker.zoomLevelMax >= zoomlevel);
	});
}