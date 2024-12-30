// mapboxgl.accessToken = mapToken;

// const map = new mapboxgl.Map({
// container: 'map', // container ID
//  center: 
//    listing.geometry.coordinates
// ,
//  // starting position [lng, lat]
// zoom: 9 // starting zoom
// });
//  const coordinates = listing.geometry.coordinates;
//  console.log(coordinates);
 
// const marker1 = new mapboxgl.Marker({color:"red"})
// .setLngLat(coordinates)
// .setPopup(new mapboxgl.Popup({offset: 25, })
// .setHTML(`<h5><b>${listing.title}</b></h5><p>Exact location will be provided after booking!!</p>`)
// )
// .addTo(map);

const map = L.map('map').setView([latitude,longitude], 13); 

console.log(latitude)
console.log(longitude)
    // Add a tile layer to the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add a marker
    const marker = L.marker([latitude,longitude]).addTo(map);
    marker.bindPopup('<b>Hello world!</b><br>I am a popup.').openPopup()

