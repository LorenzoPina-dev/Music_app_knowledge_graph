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

const getQueryCanzone = (codiceMusicista, nomeCanzone,ancheAlbum=true) => `
SELECT ?artistaNome ?artista ?genere ?nomeGenere ?pubblicazione ?oggalbum ?album WHERE {
    ?artista wdt:P1902 "${codiceMusicista}" ;
             rdfs:label ?artistaNome.
    ?canzoni wdt:P175  ?artista ;
             rdfs:label "${nomeCanzone}"@en ;
             wdt:P136 ?genere ;
             wdt:P577 ?pubblicazione ;
             wdt:P31 ?in.
    ?genere rdfs:label ?nomeGenere.
    ?in rdfs:label ?instanza.
  
    ${  ancheAlbum ?
        `optional {
            #DA TOGLIERE SE NON DEVO DARE GLI ALBUM
            ?canzoni wdt:P31 wd:Q482994 ;
                     rdfs:label ?album. 
            bind(?canzoni as ?oggalbum).
        }` :
        ""
    }
    optional {
        ?canzoni wdt:P31 wd:Q134556 ;
                 wdt:P361 ?a. 
        ?a rdfs:label ?album. 
        bind(?a as ?oggalbum).
    }
  
    # Filtra i titoli in inglese
    FILTER (lang(?album) = "en")
    FILTER (lang(?instanza) = "en")
    FILTER (lang(?artistaNome) = "en")
    FILTER (lang(?nomeGenere) = "en")
}`;

module.exports = {getQueryCanzoniMusicista,getInfoArtista,getQueryCanzone};