// routes/userRoutes.js
//const fs=require('fs');
const express = require("express"),
      router = express.Router(),
      { getSongs, getListPlaylists } = require('./../utils/LeggiFile.js'),
      playlists = getListPlaylists(50),
      datasetSongs = getSongs();
//fs.writeFileSync("what.json",JSON.stringify( datasetSongs));
// Rotta GET

router.get('/numeroPlaylist', (_, res) => {
    res.json({ numPlaylist: playlists.length });
});

router.get('/getNplaylist', (req, res) => {
    const filtro = req.query.filtro,
          partenza = req.query.start ?? 0,
          quanti = req.query.max ?? 50;

    if (filtro === undefined) {
        const risp = playlists.slice(partenza, quanti).map(p => {
            const {tracks, ...risposta} = p;
            return risposta
        });
        res.json(risp);
        return;
    }

    const risp = playlists
                    .filter(p => p.name.toLowerCase().includes(filtro.toLowerCase()))
                    .slice(partenza, quanti).map(p => {
                        const {tracks, ...risposta} =p;
                        return risposta
                    });
    res.json(risp);
  });

  router.get('/getSongPlaylist', (req, res) => {
    let idPlaylist = req.query.idPlaylist;
    if (idPlaylist === undefined) {
        res.status(400).send("Mancante l'id della playlist");
        return;
    }
    idPlaylist = Number(idPlaylist);

    const playlist = playlists.filter(playlist => playlist.pid === idPlaylist)[0];
    if (playlist === undefined) {
        res.sendStatus(400);
        return;
    }

    res.json(playlist.tracks);
});

router.get('/getAutoriInPlaylist', (req, res) => {
    let idPlaylist = req.query.idPlaylist;
    if (idPlaylist === undefined) {
        res.status(400).send("Mancante l'id della playlist");
        return;
    }
    idPlaylist = Number(idPlaylist);

    const playlist = playlists.filter(playlist => playlist.pid === idPlaylist)[0];
    if (playlist === undefined) {
        res.sendStatus(400);
        return;
    }

    const autori = playlist.tracks.map(track => track.artist_name);
    res.json([...new Set(autori)]);
});


router.get('/getAutoreSong', (req, res) => {
    const track_name = req.query.track_name;
    if (track_name === undefined) {
        res.status(400).send("Mancante il track_name della canzone");
        return;
    }

    const song = datasetSongs.filter(playlist => playlist.track_name === track_name)[0];
    if (song === undefined) {
        res.sendStatus(400);
        return;
    }
    
    res.json(song.artist_name);
});

router.get('/songs', (_, res) => {
    res.json(datasetSongs);
});

// router.get('/songPlaylist', (req, res) => {
//     const idPlaylist = req.query.idPlaylist;
//     if(idPlaylist === undefined) {
//         res.sendStatus(400);
//         return;
//     }

//     //console.log(playlists.filter(p=>p.pid==idPlaylist))
//     const songsPlaylist = playlists.filter(p => p.pid === idPlaylist)[0].tracks;
//     res.json(songsPlaylist);
// });

// Esporta il router
module.exports = router;
