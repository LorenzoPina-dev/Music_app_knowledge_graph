const getQueryCanzoniMusicista = (codiceMusicista, ancheAlbum=true) => `
SELECT ?artista ?canzoni ?genere ?pubblicazione ?album WHERE {
    ?artista wdt:P1902 "${codiceMusicista}".
    # ?canzoni rdfs:label "Unwell"@en.
    ?canzoni wdt:P175 ?artista ;
             wdt:P136 ?genere ;
             wdt:P577 ?pubblicazione ;
             wdt:P31 ?in.
    ?in rdfs:label ?instanza.
  
    ${ ancheAlbum ?
        `OPTIONAL {
            #DA TOGLIERE SE NON DEVO DARE GLI ALBUM
            ?canzoni wdt:P31 wd:Q482994 ;
                     rdfs:label ?album. 
        }` :
        ""
    }
    OPTIONAL {
        ?canzoni wdt:P31 wd:Q134556 ;
                 wdt:P361 ?a. 
        ?a rdfs:label ?album. 
    }

    # Filtra i titoli in inglese
    FILTER (lang(?album) = "en")
    FILTER (lang(?instanza) = "en")
}`;

const getElement = string => `https://www.wikidata.org/w/api.php?action=query&list=search&srsearch=${string}&format=json&srlimit=100`;
const getElement = string => `https://www.wikidata.org/w/api.php?action=query&list=search&srsearch=${string}&format=json&srlimit=100`;

const getInfoArtista = codiceArtista => `
select distinct ?artista ?image ?startWork ?coord where {
    ?artista wdt:P1902 "${codiceArtista}";
             wdt:P18 ?image;
             wdt:P2031 ?startWork;
             wdt:P136 ?genere;
             wdt:P495 ?origin.
  
   ?origin wdt:P625 ?coord.
         # dbo:birthDate ?birtDate;
         # dbo:birthPlace ?birtPlace.
         # ?birtPlace georss:point ?coord.
} LIMIT 100`

const getQueryCanzone = (codiceMusicista, nomeCanzone) => `
SELECT distinct ?canzoni ?artistaNome ?artista ?genere ?nomeGenere ?pubblicazione ?oggalbum ?album WHERE {
    ?artista wdt:P1902 "${codiceMusicista}";
        rdfs:label ?artistaNome.
    FILTER (lang(?artistaNome) = "en")
    ?canzoni wdt:P175  ?artista;
        rdfs:label ?nomeCanzone.
    OPTIONAL {
        ?canzoni rdfs:label "${nomeCanzone}"@en;
    }
    FILTER(LCASE(?nomeCanzone)=LCASE("${nomeCanzone}"@en)).
    #FILTER(lang(?nomeCanzone)="en").
    OPTIONAL {
        ?canzoni wdt:P577 ?pubblicazione;
    }
    OPTIONAL {
        ?canzoni wdt:P361 ?a. 
        ?a wdt:P577 ?pubblicazione.
    }
    OPTIONAL {
        ?canzoni wdt:P136 ?genere.
        ?genere rdfs:label ?nomeGenere.
    }
    OPTIONAL {
        ?canzoni wdt:P361 ?a. 
        ?a wdt:P136 ?genere.
        ?genere rdfs:label ?nomeGenere.
    }
    FILTER (lang(?nomeGenere) = "en")
    OPTIONAL {
        ?canzoni wdt:P31 	 wd:Q482994.
        ?canzoni rdfs:label ?album. 
        FILTER (lang(?album) = "en")
        bind(?canzoni as ?oggalbum).
    }
    OPTIONAL {
        ?canzoni wdt:P361 ?a. 
        ?a rdfs:label ?album. 
        FILTER (lang(?album) = "en")
        bind(?a as ?oggalbum).
    }
} LIMIT 100
`;

const getQueryCanzoniFatteDaId = (artists, nomeCanzone=undefined) => `
SELECT distinct ?nomeCanzone ?canzoni ?artistaNome  ?artista ?genere ?nomeGenere  ?pubblicazione ?oggalbum ?album WHERE {

    #bind(wd:Q4879921 as ?canzoni) .
  
    VALUES ?artista { ${artists.map(q => `wd:${q}`).join(" ")} }.
    ?artista rdfs:label ?artistaNome.
    FILTER (lang(?artistaNome) = "en")
    ?canzoni wdt:P175  ?artista;
        rdfs:label ?nomeCanzone.
    ${nomeCanzone==undefined ?"":
      `FILTER(REGEX(?nomeCanzone, "${nomeCanzone}", "i") || REGEX("${nomeCanzone}", ?nomeCanzone, "i")).`
    }
    FILTER(lang(?nomeCanzone)="en").
    OPTIONAL{
        ?canzoni wdt:P577 ?pubblicazione;
     }
    OPTIONAL{
        ?canzoni wdt:P361 ?a. 
        ?a wdt:P577 ?pubblicazione.
      }
    OPTIONAL{
        ?canzoni wdt:P136 ?genere.
        ?genere rdfs:label ?nomeGenere.
    FILTER (lang(?nomeGenere) = "en")
      }
    OPTIONAL{
        ?canzoni wdt:P361 ?a. 
        ?a wdt:P136 ?genere.
        ?genere rdfs:label ?nomeGenere.
    FILTER (lang(?nomeGenere) = "en")
      }
    OPTIONAL{
        ?canzoni wdt:P31 	 wd:Q482994.
        ?canzoni rdfs:label ?album. 
        FILTER (lang(?album) = "en")
        bind(?canzoni as ?oggalbum).
    }
    OPTIONAL{
        ?canzoni wdt:P361 ?a. 
        ?a rdfs:label ?album. 
        FILTER (lang(?album) = "en")
        bind(?a as ?oggalbum).
    }
}
`;

/*
const getInfoCanzoneByLabels = (labels,artists) => `
SELECT distinct ?canzoni ?artistaNome  ?artista ?genere ?nomeGenere  ?pubblicazione ?oggalbum ?album WHERE {

    #bind(wd:Q4879921 as ?canzoni) .
  
    VALUES ?canzoni { ${labels.map(q => `wd:${q}`).join(" ")} }.
    ${ (artists !== undefined) ?
        `VALUES ?artista { ${artists.map(q => `wd:${q}`).join(" ")} }.` :
        ""
    }
    ?canzoni wdt:P175  ?artista;
             rdfs:label ?nomeCanzone.
    ?artista rdfs:label ?artistaNome.
  
    FILTER (lang(?artistaNome) = "en")
    #FILTER(lang(?nomeCanzone)="en").
    OPTIONAL {
        ?canzoni wdt:P577 ?pubblicazione;
    }
    OPTIONAL {
        ?canzoni wdt:P361 ?a. 
        ?a wdt:P577 ?pubblicazione.
    }
    OPTIONAL {
        ?canzoni wdt:P136 ?genere.
        ?genere rdfs:label ?nomeGenere.
    }
    OPTIONAL {
        ?canzoni wdt:P361 ?a. 
        ?a wdt:P136 ?genere.
        ?genere rdfs:label ?nomeGenere.
    }
    FILTER (lang(?nomeGenere) = "en")
    OPTIONAL {
        ?canzoni wdt:P31 	 wd:Q482994.
        ?canzoni rdfs:label ?album. 
        FILTER (lang(?album) = "en")
        bind(?canzoni as ?oggalbum).
    }
    OPTIONAL {
        ?canzoni wdt:P361 ?a. 
        ?a rdfs:label ?album. 
        FILTER (lang(?album) = "en")
        bind(?a as ?oggalbum).
    }
} LIMIT 100`;*/


const findSongByCodiciArtistAndSongName=(codiciArtisti,nomeCanzone)=>`
SELECT DISTINCT  ?artista  ?canzoni  WHERE {
    values ?artista {${codiciArtisti.map(q => `wd:${q}`).join(" ")}}.
    {
        ?artista  wdt:P358/wdt:P2354/wdt:P658| wdt:P1455|wdt:P800|wdt:P800/wdt:P527 ?canzoni.
    }
    UNION{
            ?canzoni (wdt:P86|wdt:P175|wdt:P162)/wdt:P658|(wdt:P86|wdt:P175|wdt:P162)  ?artista;
    }
    ?canzoni rdfs:label ?canzoniLabel.
    FILTER(REGEX(?canzoniLabel, "${nomeCanzone}", "i") || REGEX("${nomeCanzone}", ?canzoniLabel, "i")).
}limit 100
`;

//const getInfoCanzoniById
const getInfoCanzoneByLabels=(idCanzoni)=>`
SELECT distinct ?canzoni ?canzoniLabel ?artista ?artistaLabel ?genere ?genereLabel ?pubblicazione ?album ?albumLabel WHERE {
    VALUES ?canzoni { ${idCanzoni.map(q => `wd:${q}`).join(" ")} }.
    ?canzoni wdt:P175  ?artista;
        wdt:P136| wdt:P361/wdt:P136 | wdt:P1433/wdt:P136 ?genere;
        wdt:P577| wdt:P361/wdt:P577 | wdt:P1433/wdt:P577 ?pubblicazione;
        wdt:P361|wdt:P1433 ?album.
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 100`

module.exports = {getQueryCanzoniMusicista,getInfoArtista,getQueryCanzone,getElement,getInfoCanzoneByLabels,getQueryCanzoniFatteDaId,findSongByCodiciArtistAndSongName};