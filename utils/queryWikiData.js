const getQueryCanzoniMusicista = (codiceMusicista,ancheAlbum=true) => `
SELECT ?artista ?canzoni ?genere ?pubblicazione ?album WHERE {
    ?artista wdt:P1902 "${codiceMusicista}".
    # ?canzoni rdfs:label "Unwell"@en.
    ?canzoni wdt:P175 ?artista ;
             wdt:P136 ?genere ;
             wdt:P577 ?pubblicazione ;
             wdt:P31 ?in.
    ?in rdfs:label ?instanza.
  
    ${ ancheAlbum ?
        `optional {
            #DA TOGLIERE SE NON DEVO DARE GLI ALBUM
            ?canzoni wdt:P31 wd:Q482994 ;
                     rdfs:label ?album. 
        }` :
        ""
    }
    optional {
        ?canzoni wdt:P31 wd:Q134556 ;
                 wdt:P361 ?a. 
        ?a rdfs:label ?album. 
    }

    # Filtra i titoli in inglese
    FILTER (lang(?album) = "en")
    FILTER (lang(?instanza) = "en")
}`;

const getElement=(string)=>`https://www.wikidata.org/w/api.php?action=query&list=search&srsearch=${string}&format=json&srlimit=100`;

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

const getQueryCanzone=(codiceMusicista, nomeCanzone)=>`
SELECT distinct ?canzoni ?artistaNome  ?artista ?genere ?nomeGenere  ?pubblicazione ?oggalbum ?album WHERE {
    ?artista wdt:P1902 "${codiceMusicista}";
        rdfs:label ?artistaNome.
    FILTER (lang(?artistaNome) = "en")              # Filtra i titoli in inglese
    ?canzoni wdt:P175  ?artista;
        rdfs:label ?nomeCanzone.
    optional{
        ?canzoni rdfs:label "${nomeCanzone}"@en;
      }
    FILTER(LCASE(?nomeCanzone)=LCASE("${nomeCanzone}"@en)).
    #FILTER(lang(?nomeCanzone)="en").
    optional{
        ?canzoni wdt:P577 ?pubblicazione;
     }
    optional{
        ?canzoni wdt:P361 ?a. 
        ?a wdt:P577 ?pubblicazione.
      }
    optional{
        ?canzoni wdt:P136 ?genere.
        ?genere rdfs:label ?nomeGenere.
      }
    optional{
        ?canzoni wdt:P361 ?a. 
        ?a wdt:P136 ?genere.
        ?genere rdfs:label ?nomeGenere.
      }
    FILTER (lang(?nomeGenere) = "en")              # Filtra i titoli in inglese
    optional{
        ?canzoni wdt:P31 	 wd:Q482994.
        ?canzoni rdfs:label ?album. 
        FILTER (lang(?album) = "en")              # Filtra i titoli in inglese
        bind(?canzoni as ?oggalbum).
    }
    optional{
        ?canzoni wdt:P361 ?a. 
        ?a rdfs:label ?album. 
        FILTER (lang(?album) = "en")              # Filtra i titoli in inglese
        bind(?a as ?oggalbum).
    }
}limit 100
`;

const getQueryCanzoniFatteDaId=(artists,nomeCanzone=undefined)=>`
SELECT distinct ?nomeCanzone ?canzoni ?artistaNome  ?artista ?genere ?nomeGenere  ?pubblicazione ?oggalbum ?album WHERE {

    #bind(wd:Q4879921 as ?canzoni) .
  
  VALUES ?artista { ${artists.map(q => `wd:${q}`).join(" ")} }.
  ?artista rdfs:label ?artistaNome.
  FILTER (lang(?artistaNome) = "en")              # Filtra i titoli in inglese
    ?canzoni wdt:P175  ?artista;
        rdfs:label ?nomeCanzone.
    ${nomeCanzone==undefined ?"":
      `FILTER(REGEX(?nomeCanzone, ${nomeCanzone}, "i") || REGEX(${nomeCanzone}, ?nomeCanzone, "i")).`
    }
    FILTER(lang(?nomeCanzone)="en").
    optional{
        ?canzoni wdt:P577 ?pubblicazione;
     }
    optional{
        ?canzoni wdt:P361 ?a. 
        ?a wdt:P577 ?pubblicazione.
      }
    optional{
        ?canzoni wdt:P136 ?genere.
        ?genere rdfs:label ?nomeGenere.
    FILTER (lang(?nomeGenere) = "en")              # Filtra i titoli in inglese
      }
    optional{
        ?canzoni wdt:P361 ?a. 
        ?a wdt:P136 ?genere.
        ?genere rdfs:label ?nomeGenere.
    FILTER (lang(?nomeGenere) = "en")              # Filtra i titoli in inglese
      }
    optional{
        ?canzoni wdt:P31 	 wd:Q482994.
        ?canzoni rdfs:label ?album. 
        FILTER (lang(?album) = "en")              # Filtra i titoli in inglese
        bind(?canzoni as ?oggalbum).
    }
    optional{
        ?canzoni wdt:P361 ?a. 
        ?a rdfs:label ?album. 
        FILTER (lang(?album) = "en")              # Filtra i titoli in inglese
        bind(?a as ?oggalbum).
    }
}
`;


const getInfoCanzoneByLabels=(labels,artists)=>`
SELECT distinct ?canzoni ?artistaNome  ?artista ?genere ?nomeGenere  ?pubblicazione ?oggalbum ?album WHERE {

    #bind(wd:Q4879921 as ?canzoni) .
  
  VALUES ?canzoni { ${labels.map(q => `wd:${q}`).join(" ")} }.
  ${
    (artists!=undefined) ?
       `VALUES ?artista { ${artists.map(q => `wd:${q}`).join(" ")} }.`:""
  }
    ?canzoni wdt:P175  ?artista;
        rdfs:label ?nomeCanzone.
  ?artista rdfs:label ?artistaNome.
  
  FILTER (lang(?artistaNome) = "en")              # Filtra i titoli in inglese
    #FILTER(lang(?nomeCanzone)="en").
    optional{
        ?canzoni wdt:P577 ?pubblicazione;
     }
    optional{
        ?canzoni wdt:P361 ?a. 
        ?a wdt:P577 ?pubblicazione.
      }
    optional{
        ?canzoni wdt:P136 ?genere.
        ?genere rdfs:label ?nomeGenere.
      }
    optional{
        ?canzoni wdt:P361 ?a. 
        ?a wdt:P136 ?genere.
        ?genere rdfs:label ?nomeGenere.
      }
    FILTER (lang(?nomeGenere) = "en")              # Filtra i titoli in inglese
    optional{
        ?canzoni wdt:P31 	 wd:Q482994.
        ?canzoni rdfs:label ?album. 
        FILTER (lang(?album) = "en")              # Filtra i titoli in inglese
        bind(?canzoni as ?oggalbum).
    }
    optional{
        ?canzoni wdt:P361 ?a. 
        ?a rdfs:label ?album. 
        FILTER (lang(?album) = "en")              # Filtra i titoli in inglese
        bind(?a as ?oggalbum).
    }
}limit 100`;

module.exports = {getQueryCanzoniMusicista,getInfoArtista,getQueryCanzone,getElement,getInfoCanzoneByLabels,getQueryCanzoniFatteDaId};