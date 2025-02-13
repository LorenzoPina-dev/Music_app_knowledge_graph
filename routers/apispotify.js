require('dotenv').config();

const express = require('express'),
      SpotifyWebApi = require('spotify-web-api-node'),
      router = express.Router();

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.CLIENT_REDIRECT_URI
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

router.get('/album', async (req, res) => {
    const idAlbum = req.query.idAlbum;

    try {
        const data =  await spotifyApi.getAlbum(idAlbum);
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
        const data = await spotifyApi.getArtist(idAutore);
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ error: err.message })
    }
})


router.get('/playlist', async (req, res) => {
    const playlistId = req.query.idPlaylist;
    try {
        const data = await spotifyApi.getPlaylist( playlistId);
        let {name,images,tracks,..._}=data.body;
        const playlist={name:name,images:images,tracks:tracks.items.map(i=>i.track)};
        res.json(playlist);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/canzone', async (req, res) => {
    const canzoneId = req.query.id;

    try {
        const track = (await spotifyApi.getTrack(canzoneId)).body;

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

function chunkArray(array, L) {
    return Array.from({ length: Math.ceil(array.length / L) }, (_, i) =>
        array.slice(i * L, i * L + L)
    );
}

router.get('/canzoni', async (req, res) => {
    const idCanzoni = req.query.idCanzoni;

    try {
        const ids = idCanzoni.split(","),
              chunks = chunkArray(ids, 100);
        let tracks = [];

        for (let i=0; i<chunks.length; i++) {
            const v = await spotifyApi.getTracks(chunks[i]);
            tracks = [...tracks, ...(await spotifyApi.getTracks(chunks[i])).body.tracks];
        }

        res.json(tracks);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
/*
router.get('/Fsongs', async (req,res) => {
    const canzoneId = req.query.id;

    try {
        const track = await spotifyApi.getAudioFeaturesForTrack(canzoneId);
        res.json(track);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});*/


module.exports = router;
