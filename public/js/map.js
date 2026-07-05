mapboxgl.accessToken = mapToken;

let coords = (Array.isArray(listing.geometry.coordinates) && listing.geometry.coordinates.length === 2)
  ? listing.geometry.coordinates
  : [77.209006, 28.613895]; // default (Delhi)

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  center: coords,
  zoom: 9,
});

new mapboxgl.Marker({color: "red"})
.setLngLat(coords)
.setPopup(new mapboxgl.Popup({ offset: 25 })
  .setHTML(
    `<h3>${listing.title}</h3><p>${listing.location}</p>`
  )
)
.addTo(map);