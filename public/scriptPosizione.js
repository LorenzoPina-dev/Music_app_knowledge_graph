// Creazione della mappa centrata sull'Italia
const map = L.map('map').setView([41.9028, 12.4964], 6);

// Aggiunta del layer della mappa (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
}).addTo(map);

// Fetch dei dati dal server
fetch('/api/locations')
  .then((response) => response.json())
  .then((locations) => {
    locations.forEach((location) => {
      // Aggiunge un marker per ogni location
      L.marker([location.lat, location.lng])
        .addTo(map)
        .bindPopup(`<b>${location.name}</b>`);
    });
  })
  .catch((error) => console.error('Errore durante il fetch:', error));
