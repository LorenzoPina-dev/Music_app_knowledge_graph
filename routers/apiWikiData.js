//const fs= require('fs');
const express= require('express'),
      { /*makeRequests, delay,*/ creaOption,fetchData} = require("../utils/GestioneRichieste.js"),
      {getQueryCanzoniMusicista,getInfoArtista,getQueryCanzone,getElement,getInfoCanzoneByLabels,getQueryCanzoniFatteDaId} = require("../utils/queryWikiData.js"),
      router = express.Router(),
      wikydata="query.wikidata.org";

router.get('/songs', (req, res) => {
    const codiceArtista = req.query.codiceArtista,
          url = `/sparql?query=${encodeURIComponent(getQueryCanzoniMusicista(codiceArtista))}&format=json`;

    fetchData(creaOption(url,wikydata), true)
        .then(dati => {
            let d = dati.results.bindings;

            console.log('Bindings:');
            console.log(d);
            
            res.json(d);
        })
        .catch((err) => {
            console.error(err);
        });
  });

  router.get('/song', (req, res) => {
    const codiceArtista = req.query.codiceArtista;
    const nomeCanzone = req.query.nomeCanzone;
    console.log(codiceArtista);
    console.log(nomeCanzone);
    fetchData(creaOption("/sparql?query="+encodeURIComponent(getQueryCanzone(codiceArtista,nomeCanzone))+"&format=json",wikydata),true) .then((dati) => {
        let d=dati.results.bindings;
        res.json(d);
      })
      .catch((error) => {
        console.error(error);
      });
  });

  router.get('/artista', (req, res) => {
    const codiceArtista = req.query.codiceArtista;
    
    fetchData(creaOption("/sparql?query="+encodeURIComponent(getInfoArtista(codiceArtista))+"&format=json",wikydata),true) .then((dati) => {
        let d=dati.results.bindings;
        res.json(d);
      })
      .catch((error) => {
        console.error(error);
      });
  });
  router.get("/elemento",(req, res) => {
    const stringa = req.query.stringa;
    
    fetchData(getElement(stringa),true) .then((dati) => {
        let d=dati.query.search;
        res.json(d);
      })
      .catch((error) => {
        console.error(error);
      });
  });
  router.post("/songById",(req, res) =>{
    const ids = req.body.codiciCanzoni;
    const artist=req.body.codiciArtisti;
    fetchData(creaOption("/sparql?query="+encodeURIComponent(getInfoCanzoneByLabels(ids,artist))+"&format=json",wikydata),true) .then((dati) => {
        let d=dati.results.bindings;
        res.json(d);
      })
     .catch((error) => {
        console.error(error);
      });
  });
  router.post("/songByIdArtisti",(req, res) =>{
    const artist=req.body.codiciArtisti;
    const nomeCanzone=req.body.nomeCanzone;
    //console.log(getQueryCanzoniFatteDaId(artist));
    fetchData(creaOption("/sparql?query="+encodeURIComponent(getQueryCanzoniFatteDaId(artist,nomeCanzone))+"&format=json",wikydata),true) .then((dati) => {
        let d=dati.results.bindings;
        res.json(d);
      })
     .catch((error) => {
      console.log(getQueryCanzoniFatteDaId(artist));
        console.error(error);
      });
  });

module.exports = router;
