require('dotenv').config();

const express = require('express'),
      SpotifyWebApi = require('spotify-web-api-node'),
      router = express.Router();

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,      // Sostituisci con il tuo clientId
    clientSecret: process.env.CLIENT_SECRET, // Sostituisci con il tuo clientSecret
    redirectUri: process.env.CLIENT_REDIRECT_URI // Imposta l'URI di redirezione
});

authenticateSpotify();

async function authenticateSpotify() {
    return new Promise(async (res,rej) => {
        try {
            const token = (await spotifyApi.clientCredentialsGrant()).body.access_token;
            spotifyApi.setAccessToken(token);
            console.log(`New Spotify token acquired: '${token}'`)
            res(void 0);
        }
        catch (err) {
            console.error('Errore durante il recupero del token:', err);
            rej(err);
        }
    })
}

async function spotifyAuthenticationHelper(fn, arg) {
    return new Promise(async (res,rej) => {
        try {
            let response = await spotifyApi[fn](arg);
            if (response.status === 401) {
                console.log("Spotify token expired.");
                await authenticateSpotify();
                response = await fn(arg);
            }
            res(response);
        }
        catch (err) {
            console.error(`Errore nella ri-autenticazione/chiamata di Spotify: ${err}`);
            rej(err);
        }
    });
}

router.get('/album', async (req, res) => {
    const idAlbum = req.query.idAlbum;

    try {
        const data = await spotifyAuthenticationHelper("getAlbum", idAlbum);
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ error: err.message })
    }
})

router.get('/albumAutore', async (req, res) => {
    const idAutore = req.query.idAutore;
    let t = Number(req.query.offset);
    const offset = t !== t ? 0 : t;

    try {
        const data = await spotifyApi.getArtistAlbums(idAutore, { album_type:"album", limit:48, offset });
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ error: err.message })
    }
})

router.get('/autore', async (req, res) => {
    const idAutore = req.query.idAutore;

    try {
        const data = await spotifyAuthenticationHelper("getArtist", idAutore);
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ error: err.message })
    }
})
 

router.get('/playlist', async (req, res) => {
    const playlistId = req.query.idPlaylist;
    //console.log(playlistId);

    try {
        const data = await spotifyAuthenticationHelper("getPlaylist", playlistId);
       // console.log(data.body.tracks.items.map(t=>t.track));
        //const data2 = await spotifyAuthenticationHelper("getPlaylistTracks", playlistId);
/*
{
            "name": "Throwbacks", 
            "collaborative": "false", 
            "pid": 0, 
            "modified_at": 1493424000, 
            "num_tracks": 52, 
            "num_albums": 47, 
            "num_followers": 1, 
            "tracks": [
                {
            */

        let {name,images,tracks,..._}=data.body;
        const playlist={name:name,images:images,tracks:tracks.items.map(t=>t.track)};
        /*const playlist = data.body.map(item => ({
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
*/
        res.json(playlist);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/canzone', async (req, res) => {
    const canzoneId = req.query.id;

    try {
        const track = (await spotifyAuthenticationHelper("getTrack", canzoneId)).body;

        // const trackDetails = {
        //     name: track.name,
        //     artists: track.artists.map(artist => artist.name),  // Artisti della traccia
        //     album: track.album.name,  // Album di appartenenza
        //     duration_ms: track.duration_ms,  // Durata della traccia in millisecondi
        //     release_date: track.album.release_date,  // Data di rilascio
        //     images: track.album.images,  // Immagini dell'album
        //     popularity: track.popularity,  // Popolarità
        //     external_urls: track.external_urls,  // URL esterni (Spotify, ecc.)
        // };

        res.json(track);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/Fsongs', async (req,res) => {
    const canzoneId = req.query.id;

    try {
        const track = await spotifyAuthenticationHelper("getAudioFeaturesForTrack", canzoneId);
        res.json(track);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
