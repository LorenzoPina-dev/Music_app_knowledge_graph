const getQueryCanzoniMusicista=(codiceMusicista)=>`
SELECT ?artista ?canzoni  ?genere ?pubblicazione  ?album WHERE {
  ?artista wdt:P1902 "${codiceMusicista}".
          ?canzoni wdt:P175  ?artista.
  #?canzoni rdfs:label "Unwell"@en.
          ?canzoni   wdt:P136 ?genere.
       ?canzoni     wdt:P577 ?pubblicazione.
  ?canzoni wdt:P31 ?in.
  ?in rdfs:label ?instanza.
  
  
  optional{#DA TOGLIERE SE NON DEVO DARE GLI ALBUM
   ?canzoni wdt:P31 	 wd:Q482994.
    
    ?canzoni rdfs:label ?album. 
    }
  {
    ?canzoni wdt:P31 	 wd:Q134556.
    ?canzoni wdt:P361 ?a. 
     ?a rdfs:label ?album. 
    
    }
   FILTER (lang(?album) = "en")              # Filtra i titoli in inglese
   FILTER (lang(?instanza) = "en")              # Filtra i titoli in inglese

}`;


const getInfoArtista=(codiceArtista)=>`
    
select distinct ?artista ?image ?startWork  ?coord where {
  ?artista wdt:P1902 "3Ngh2zDBRPEriyxQDAMKd1";
           wdt:P18 ?image;
           wdt:P2031 ?startWork;
           wdt:P136 ?genere;
           wdt:P495 ?origin.
  
  ?origin wdt:P625 ?coord.
      # dbo:birthDate  ?birtDate;
      # dbo:birthPlace   ?birtPlace.
#?birtPlace georss:point ?coord.
} LIMIT 100
`

const getQueryCanzone=(codiceMusicista, nomeCanzone)=>`
SELECT  ?artistaNome ?artista ?genere ?nomeGenere  ?pubblicazione ?oggalbum ?album WHERE {
  ?artista wdt:P1902 "${codiceMusicista}";
           rdfs:label ?artistaNome.
          ?canzoni wdt:P175  ?artista.
  ?canzoni rdfs:label "${nomeCanzone}"@en.
          ?canzoni   wdt:P136 ?genere.
  ?genere rdfs:label ?nomeGenere.
       ?canzoni     wdt:P577 ?pubblicazione.
  ?canzoni wdt:P31 ?in.
  ?in rdfs:label ?instanza.
  
  
  optional{#DA TOGLIERE SE NON DEVO DARE GLI ALBUM
   ?canzoni wdt:P31 	 wd:Q482994.
    
    ?canzoni rdfs:label ?album. 
    bind(?canzoni as ?oggalbum).
    }
  {
    ?canzoni wdt:P31 	 wd:Q134556.
    ?canzoni wdt:P361 ?a. 
     ?a rdfs:label ?album. 
    bind(?a as ?oggalbum).
    
    }
  
   FILTER (lang(?album) = "en")              # Filtra i titoli in inglese
   FILTER (lang(?instanza) = "en")              # Filtra i titoli in inglese
   FILTER (lang(?artistaNome) = "en")              # Filtra i titoli in inglese
   FILTER (lang(?nomeGenere) = "en")              # Filtra i titoli in inglese

}`;

module.exports = {getQueryCanzoniMusicista,getInfoArtista,getQueryCanzone};