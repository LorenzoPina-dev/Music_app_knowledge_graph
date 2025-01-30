// routes/userRoutes.js
const fs=require('fs');
const express = require("express");
const router = express.Router();
const { getSongs, getListPlaylists }=require('./../utils/LeggiFile.js');
const playlists=getListPlaylists(50);
const datasetSongs=getSongs();
//fs.writeFileSync("what.json",JSON.stringify( datasetSongs));
// Rotta GET

router.get('/numeroPlaylist', (req, res) => {
    res.json({ numPlaylist: playlists.length });
});

router.get('/getNplaylist', (req, res) => {
    const filtro=req.query.filtro;
    let quanti=req.query.max;
    let partenza=req.query.start;
    if(partenza==undefined)
      partenza=0;
    if(quanti==undefined)
      quanti=50;
    console.log(partenza);
    console.log(quanti);
    if(filtro==undefined) {
      const risp=playlists.slice(partenza, quanti).map(p=>{
        const {tracks, ...risposta} =p;
        return risposta} ) ;
      res.json(risp);
      return;
    }
    const risp= playlists.filter(p=>p.name.toLowerCase().includes(filtro.toLowerCase())).slice(partenza, quanti).map(p=>{
        const {tracks, ...risposta} =p;
        return risposta} ) ;
        res.json(risp);
  });

  router.get('/getSongPlaylist', (req, res) => {
    const idPlaylist=req.query.idPlaylist;
    if(idPlaylist==undefined) {
      res.status(400).send("Mancante l'id della playlist");
      return;
    }
    const songs=playlists.filter(playlist => playlist.pid==idPlaylist)[0].tracks;
    res.json(songs);
});

router.get('/getAutoriInPlaylist', (req, res) => {
    const idPlaylist=req.query.idPlaylist;
    if(idPlaylist==undefined) {
      res.status(400).send("Mancante l'id della playlist");
      return;
    }
    const songs=playlists.filter(playlist => playlist.pid==idPlaylist)[0].tracks;
    const autori=songs.map(track =>track.artist_name);
    res.json([...new Set(autori)]);
});


router.get('/getAutoreSong', (req, res) => {
    const track_name=req.query.track_name;
    if(track_name==undefined) {
      res.status(400).send("Mancante il track_name della canzone");
      return;
    }
    const song=datasetSongs.filter(playlist => playlist.track_name==track_name);
    console.log(song);
    
    res.json(song[0].artist_name);
});

// Rotta GET per le playlist


router.get('/songs', (req, res) => {
    res.json(datasetSongs.slice(0));
  });
  router.get('/songPlaylist', (req, res) => {
    const idPlaylist=req.query.idPlaylist;
    if(idPlaylist==undefined)
    {
      res.sendStatus(400);
      return;
    }
    console.log(playlists.filter(p=>p.pid==idPlaylist))
    const songsPlaylist=playlists.filter(p=>p.pid==idPlaylist)[0].tracks;
    res.json(songsPlaylist);
  });

// Esporta il router
module.exports = router;
