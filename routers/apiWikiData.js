const express = require('express'),
      { /*makeRequests, delay,*/ creaOption,fetchData} = require("../utils/GestioneRichieste.js"),
      { getQueryCanzoniMusicista,
        getInfoArtista,
        getQueryCanzone,
        getElement, 
        getInfoCanzoneByLabels,
        getQueryCanzoniFatteDaId,
        findSongByCodiciArtistAndSongName
      } = require("../utils/queryWikiData.js");

router = express.Router(),
wikydata = "query.wikidata.org";

router.get('/songs', async (req, res) => {
    const codiceArtista = req.query.codiceArtista;

    try {
        const url = `/sparql?query=${ encodeURIComponent(getQueryCanzoniMusicista(codiceArtista)) }&format=json`,
              data = await fetchData(creaOption(url, wikydata), true);
        res.json(data.results.bindings);
    }
    catch (err) {
        console.error(err);
    }
});

router.get('/song', async (req, res) => {
    const codiceArtista = req.query.codiceArtista,
          nomeCanzone = req.query.nomeCanzone;

    try {
        const url = `/sparql?query=${ encodeURIComponent(getQueryCanzone(codiceArtista,nomeCanzone)) }&format=json`,
              data = await fetchData(creaOption(url, wikydata), true);
        res.json(data.results.bindings);
    }
    catch (err) {
        console.error(err);
    }
});

router.get('/artista', async (req, res) => {
    const codiceArtista = req.query.codiceArtista;

    try {
        const url = `/sparql?query=${ encodeURIComponent(getInfoArtista(codiceArtista)) }&format=json`,
              data = await fetchData(creaOption(url, wikydata), true);
        res.json(data.results.bindings)
    }
    catch (err) {
        console.error(err);
    }
});

router.get("/elemento", async (req, res) => {
    const stringa = req.query.stringa;

    try {
        const data = await fetchData(getElement(stringa), true);
        res.json(data.query.search);
    }
    catch (err) {
        console.error(err);
    }
});

router.post("/songById", async (req, res) =>{
    const ids = req.body.codiciCanzoni;

    try {
        const url = `/sparql?query=${ encodeURIComponent(getInfoCanzoneByLabels(ids)) }&format=json`,
              data = await fetchData(creaOption(url, wikydata), true);
        res.json(data.results.bindings);
    }
    catch (err) {
        console.error(err);
    }
});

router.post("/songByIdArtisti", async (req, res) =>{
    const artist = req.body.codiciArtisti,
          nomeCanzone = req.body.nomeCanzone;

    try {
        const url = `/sparql?query=${ encodeURIComponent(getQueryCanzoniFatteDaId(artist,nomeCanzone)) }&format=json`,
              data = await fetchData(creaOption(url, wikydata), true);
        res.json(data.results.bindings);
    }
    catch (err) {
        console.log(getQueryCanzoniFatteDaId(artist));
        console.error(err);
    }
});

router.post("/gettest", async (req, res) =>{
    const artist = req.body.codiciArtisti,
          nomeCanzone = req.body.nomeCanzone;
    
    try {
        const url = `/sparql?query=${ encodeURIComponent(findSongByCodiciArtistAndSongName(artist,nomeCanzone)) }&format=json`,
              data = await fetchData(creaOption(url, wikydata), true);
        res.json(data.results.bindings);
    }
    catch (err) {
        console.log(getQueryCanzoniFatteDaId(artist));
        console.error(err);
    }
});

module.exports = router;
