mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
container: 'map', // container ID
 center: 
   listing.geometry.coordinates
,
 // starting position [lng, lat]
zoom: 9 // starting zoom
});
 const coordinates = listing.geometry.coordinates;
 console.log(coordinates);
 
const marker1 = new mapboxgl.Marker({color:"red"})
.setLngLat(coordinates)
.setPopup(new mapboxgl.Popup({offset: 25, })
.setHTML(`<h5><b>${listing.title}</b></h5><p>Exact location will be provided after booking!!</p>`)
)
.addTo(map);
