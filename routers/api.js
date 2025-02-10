const express = require("express"),
      router = express.Router(),
      { getSongs, getListPlaylists,getPlaylistDyId } = require('./../utils/LeggiFile.js'),
      playlists = getListPlaylists(10),
      datasetSongs = getSongs();

router.get('/numeroPlaylist', (_, res) => {
    res.json({ numPlaylist: playlists.length });
});


router.get('/song', (req, res) => {
    const idPlaylist = Number(req.query.idPlaylist);
    const idCanzone = Number(req.query.idCanzone);
    const filePlaylist=getPlaylistDyId(idPlaylist);
    const playlist=filePlaylist.filter(playlist =>playlist.pid===idPlaylist);
    if(playlist.length===0) return res.status(404).json({error: "Playlist non trovata"});
    let canzone=playlist[0].tracks.filter(c=>c.pos===idCanzone);
    if(canzone.length===0) return res.status(404).json({error: "Canzone non trovata"});
    res.json(canzone[0]);
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
                        const {tracks, ...risposta} = p;
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

// Esporta il router
module.exports = router;
