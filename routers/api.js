const express = require("express"),
      fs=require("fs");
const 
      router = express.Router(),
      { getSongs, getPlaylistDyId/*,getNames,getListPlaylists*/ } = require('./../utils/LeggiFile.js'),
      datasetSongs = getSongs(),
      playlists=JSON.parse(fs.readFileSync("nomiPlaylist.json"));

    //fs.writeFileSync("nomiPlaylist.json", JSON.stringify(nomi));
      
router.get('/numeroPlaylist', (_, res) => {
    res.json({ numPlaylist: playlists.length });
});



router.get('/getNplaylist', (req, res) => {
    let filtro = req.query.filtro,
          partenza = req.query.start ?? 0,
          quanti = req.query.max ?? 50;

    if (filtro === undefined) {
        const risp = playlists.slice(partenza, quanti).map((p,i)=>{return {pid:i+partenza, name:p}});
        res.json(risp);
        return;
    }

    let risp = [];
    let trovati=0;
    let i=0;
    filtro=filtro.toLowerCase();
    while(i<playlists.length && risp.length<quanti){
        var playlist = playlists[i];
        if (playlist.toLowerCase().includes(filtro)) {
            trovati++;
            if(trovati>=partenza)
                risp.push({pid:i, name:playlist});
        }
        i++;
    }
    res.json(risp);
});

  router.get('/getPlaylist', (req, res) => {
    let idPlaylist = req.query.idPlaylist;
    if (idPlaylist === undefined) {
        res.status(400).send("Mancante l'id della playlist");
        return;
    }
    idPlaylist = Number(idPlaylist);

    const playlist = getPlaylistDyId(idPlaylist).filter(p => p.pid === idPlaylist)[0];
    if (playlist === undefined) {
        res.sendStatus(400);
        return;
    }

    res.json(playlist);
});


router.get('/songFeature', (req, res) => {
    const track_name = req.query.track_name.toLocaleLowerCase();
    if (track_name === undefined) {
        res.status(400).send("Mancante il track_name della canzone");
        return;
    }

    const song = datasetSongs.filter(playlist => playlist.track_name === track_name);
    if (song.length===0) {
        res.status(400).json({ error:"nome_canzone non trovato"});
        return;
    }
    
    res.json(song[0]);
});
/*
router.get('/songs', (_, res) => {
    res.json(datasetSongs);
});
/*
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
});*/

/*
router.get('/song', (req, res) => {
    const idPlaylist = Number(req.query.idPlaylist);
    const idCanzone = Number(req.query.idCanzone);
    const filePlaylist=getPlaylistDyId(idPlaylist);
    const playlist=filePlaylist.filter(playlist =>playlist.pid===idPlaylist);
    if(playlist.length===0) return res.status(404).json({error: "Playlist non trovata"});
    let canzone=playlist[0].tracks.filter(c=>c.pos===idCanzone);
    if(canzone.length===0) return res.status(404).json({error: "Canzone non trovata"});
    res.json(canzone[0]);
});*/

// Esporta il router
module.exports = router;
