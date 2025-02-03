const express= require('express');
const fs= require('fs');
const {makeRequests, delay, creaOption,fetchData} =require("../utils/GestioneRichieste.js");
const {getQueryCanzoniMusicista,getInfoArtista,getQueryCanzone} = require("../utils/queryWikiData.js");
const router = express.Router();
const wikydata="query.wikidata.org";

  router.get('/songs', (req, res) => {
    const codiceArtista = req.query.codiceArtista;
    fetchData(creaOption("/sparql?query="+encodeURIComponent(getQueryCanzoniMusicista(codiceArtista))+"&format=json",wikydata),true) .then((dati) => {
        let d=dati.results.bindings;
        res.json(d);
      })
      .catch((error) => {
        console.error(error);
      });
  });

  router.get('/song', (req, res) => {
    const codiceArtista = req.query.codiceArtista;
    const nomeCanzone = req.query.nomeCanzone;
    
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


module.exports = router;
