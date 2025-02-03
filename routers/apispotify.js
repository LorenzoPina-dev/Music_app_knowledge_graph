require('dotenv').config();
const express= require('express');
const SpotifyWebApi= require('spotify-web-api-node');
const fs= require('fs');
const router = express.Router();


const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,      // Sostituisci con il tuo clientId
    clientSecret:  process.env.CLIENT_SECRET, // Sostituisci con il tuo clientSecret
    redirectUri:  process.env.CLIENT_REDIRECT_URI // Imposta l'URI di redirezione
  });
  let token="";
  spotifyApi.clientCredentialsGrant().then(
    (data) => {
      token=data.body['access_token'];
      spotifyApi.setAccessToken(token);
      console.log('Accesso riuscito, token: ', token);
    },
    (err) => {
      console.error('Errore durante il recupero del token:', err);
    }
  );
 

  router.get('/playlist', (req, res) => {
    const playlistId = req.query.idPlaylist;
    console.log(playlistId);
    
    spotifyApi.getPlaylistTracks(playlistId)
      .then((data) => {
        let tracks = data.body.items.map(item => ({
        name: item.track.name,
        artists: item.track.artists.map(artist => artist.id),
        album: item.track.album.name,
        release_date: item.track.album.release_date,
        duration_ms: item.track.duration_ms,
        popularity: item.track.popularity,
        spotify_url: item.track.external_urls.spotify,
        preview_url: item.track.preview_url,
        image: item.track.album.images.length > 0 ? item.track.album.images[0].url : null,
      }));
      res.json(tracks);
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });
  router.get('/canzone', (req, res) => {
    const canzoneId = req.query.id;
  
    console.log(canzoneId);
    
    spotifyApi.getTrack(canzoneId)
      .then((data) => {
        const track = data.body;
       const trackDetails = {
        name: track.name,
        artists: track.artists.map(artist => artist.name),  // Artisti della traccia
        album: track.album.name,  // Album di appartenenza
        duration_ms: track.duration_ms,  // Durata della traccia in millisecondi
        release_date: track.album.release_date,  // Data di rilascio
        images: track.album.images,  // Immagini dell'album
        popularity: track.popularity,  // Popolarità
        external_urls: track.external_urls,  // URL esterni (Spotify, ecc.)
      };

      res.json(track);  // Restituisce i dettagli della traccia
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  router.get('/Fsongs',(req,res)=>{
    const canzoneId = req.query.id;
    console.log(canzoneId);

      spotifyApi.getAudioFeaturesForTrack(canzoneId)
      .then((data) => {
        const track = data.body;
        res.json(track);  // Restituisce i dettagli della traccia
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: err.message });
      });
  });


module.exports = router;
