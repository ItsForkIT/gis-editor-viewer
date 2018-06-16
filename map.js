var map = L.map('map', {drawControl: true}).fitWorld();

// create the tile layer with correct attribution
var osmUrl='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
var osm = new L.TileLayer(osmUrl, {minZoom: 2, maxZoom: 18, attribution: osmAttrib});       

// start the map in NIT Dgp
map.setView(new L.LatLng(23.5499538, 87.2856928),15);
map.addLayer(osm);



// Current Location
function onLocationFound(e) {
    var radius = e.accuracy / 2;

    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

    L.circle(e.latlng, radius).addTo(map);
}

map.on('locationfound', onLocationFound);


var ourCustomControl = L.Control.extend({ 
  options: {
    position: 'topright' 
    //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
  },
  onAdd: function (map) {
    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
    container.style.backgroundColor = '#8a8a8a';
    container.style.backgroundImage = "url('images/marker-icon.png')";
    container.style.backgroundSize = "30px";
    container.style.width = '30px';
    container.style.height = '30px';
    container.onclick = function(){
    console.log('goTolocation');
    map.locate({setView: true, maxZoom: 18});
    }
    return container;
  },
 
});
map.addControl(new ourCustomControl());


// Plot Existing Data
db.collection("gisObjects").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        // doc.data() is never undefined for query doc snapshots
        // console.log(doc.id, " => ", doc.data());
        // console.log(doc.data().GeoJSON);
        L.geoJSON(JSON.parse(doc.data().GeoJSON)).addTo(map);
    });
});



// Draw Event
map.on(L.Draw.Event.CREATED, function (e) {
   var type = e.layerType,
       layer = e.layer;
   if (type === 'marker') {
       // Do marker specific actions
   }

   var geojson = e.layer.toGeoJSON();
   // Do whatever else you need to. (save to db; add to map etc)
   var description_input = prompt("Please enter some descriotion: (eg: techno, stationary shop)");

   console.log("saving.." + description_input + geojson);
   console.log(geojson);

    var date = Date().toString();
    db.collection("gisObjects").add({
        GeoJSON: JSON.stringify(geojson),
        timestamp: date,
        type: type,
        description: description_input
    })
    .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
        alert("data saved successfully..");
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });

   map.addLayer(layer);
});

