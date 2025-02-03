const express = require('express');
const fs= require('fs');
const apiRouter = require("./routers/api.js"); // Importa il router
const apiWikiDataRouter = require("./routers/apiWikiData.js"); // Importa il router
const apiSpotifyRouter = require("./routers/apispotify.js"); // Importa il router
const app = express();
const port = 3000;


// Dati da mostrare sulla mappa
const locations = [
  { name: 'Roma', lat: 41.9028, lng: 12.4964 },
  { name: 'Milano', lat: 45.4642, lng: 9.1900 },
  { name: 'Napoli', lat: 40.8518, lng: 14.2681 },
];

app.use("/api/spotify", apiSpotifyRouter); // Usa le rotte sotto "/users"
app.use("/api/wikidata", apiWikiDataRouter); // Usa le rotte sotto "/users"

app.use("/api", apiRouter); // Usa le rotte sotto "/users"

app.get('/api/locations', (req, res) => {
  res.json(locations);
});


// Serve i file statici (per il frontend)
app.use(express.static('public'));

// Serve i dati delle location

// Avvia il server
app.listen(port, () => {
  console.log(`Server avviato su http://localhost:${port}`);
});
