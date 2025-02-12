const express = require('express'),
      { /*makeRequests, delay,*/ creaOption,fetchData} = require("../utils/GestioneRichieste.js"),
      {getInfoArtistaByIdSpotify,
        getInfoArtistaByCodiciWikidata,
        getElement,
        getInfoCanzoneByLabels,
        findSongByCodiciArtistAndSongName,
        getAltroArtistaByPremio,
        getAltraCanzoneByGenere}= require("../utils/queryWikiData.js"),
      /*{ getPubblicazioneAlbum,
              getQueryCanzoniMusicista,
              getInfoArtistaByIdSpotify,
              getInfoArtistaByCodiciWikidata,
              getQueryCanzone,
              getElement, 
              getInfoCanzoneByLabels,
              getQueryCanzoniFatteDaId,
              findSongByCodiciArtistAndSongName
            } = require("../utils/queryWikiData.js");*/
      router = express.Router(),
      wikydata = "query.wikidata.org";


router.post('/artista', async (req, res) => {
    const codiciArtisti = req.body.codiciArtisti;
    const limit = req.body.limit??100;
    try {
        const url = `/sparql?query=${ encodeURIComponent(getInfoArtistaByCodiciWikidata(codiciArtisti,limit)) }&format=json`,
              data = await fetchData(creaOption(url, wikydata), true);
        res.json(data.results.bindings)
    }
    catch (err) {
        console.error(err);
    }
});

router.get('/artista', async (req, res) => {
    const idSpotify = req.query.idSpotify;
    const limit = req.query.limit??100;
    try {
        const url = `/sparql?query=${ encodeURIComponent(getInfoArtistaByIdSpotify(idSpotify,limit)) }&format=json`,
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
router.post("/suggerimentoArtista", async (req, res) => {
    const codicePremio = req.body.codicePremio,
          codiciArtisti = req.body.codiciArtisti;
    try {
        const url = `/sparql?query=${ encodeURIComponent(getAltroArtistaByPremio(codicePremio,codiciArtisti)) }&format=json`,
        data = await fetchData(creaOption(url, wikydata), true);
        res.json(data.results.bindings);
    }
    catch (err) {
        console.error(err);
    }
});
router.post("/suggerimentoCanzone", async (req, res) => {
    const codiceGenere = req.body.codiceGenere,
          codiciArtisti = req.body.codiciArtisti;

    try {
        const url = `/sparql?query=${ encodeURIComponent(getAltraCanzoneByGenere(codiceGenere,codiciArtisti)) }&format=json`,
        data = await fetchData(creaOption(url, wikydata), true);
        res.json(data.results.bindings);
    }
    catch (err) {
        console.error(err);
    }
});

router.post("/songById", async (req, res) =>{
    const ids = req.body.codiciCanzoni;
    const all= req.body.all;
    const limit= req.body.limit??100;
    try {
        const url = `/sparql?query=${ encodeURIComponent(getInfoCanzoneByLabels(ids,limit,all)) }&format=json`,
              data = await fetchData(creaOption(url, wikydata), true);
        res.json(data.results.bindings);
    }
    catch (err) {
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
        console.error(err);
    }
});

router.post("/album", async (req, res) =>{
    const codiciAlbum = req.body.codiciAlbum;
    console.log(getPubblicazioneAlbum(codiciAlbum));
    try {
        const url = `/sparql?query=${ encodeURIComponent(getPubblicazioneAlbum(codiciAlbum)) }&format=json`,
              data = await fetchData(creaOption(url, wikydata), true);
        res.json(data.results.bindings);
    }
    catch (err) {
        console.error(err);
    }
});


/*
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
});*/

/*router.post("/songByIdArtisti", async (req, res) =>{
    const artist = req.body.codiciArtisti,
          nomeCanzone = req.body.nomeCanzone;

    try {
        const url = `/sparql?query=${ encodeURIComponent(getQueryCanzoniFatteDaId(artist,nomeCanzone)) }&format=json`,
              data = await fetchData(creaOption(url, wikydata), true);
        res.json(data.results.bindings);
    }
    catch (err) {
        console.error(err);
    }
});*/


module.exports = router;
