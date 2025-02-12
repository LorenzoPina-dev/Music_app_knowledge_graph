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

const getElement=(string)=>`https://www.wikidata.org/w/api.php?action=query&list=search&srsearch=${string}&format=json&srlimit=50`;



const getInfoArtistaByIdSpotify = (codiceArtista,limit) =>
    `select distinct ?artista ?image ?startWork ?originLabel ?coord ?premi ?premiLabel where {
        ?artista wdt:P1902 "${codiceArtista}";
        optional{
            ?artista wdt:P569|wdt:P571 ?startWork;
        }
        optional{
            ?artista wdt:P19|wdt:P19/wdt:P1366 ?origin.
            ?origin wdt:P625 ?coord;
                    rdfs:label ?originLabel.
        }
        optional{
            ?artista wdt:P740|wdt:P740/wdt:P1366 ?origin.
            ?origin wdt:P625 ?coord;
                    rdfs:label ?originLabel.
        }
        optional{
            ?artista wdt:P495|wdt:P495/wdt:P1366 ?origin.
            ?origin wdt:P625 ?coord;
                    rdfs:label ?originLabel.
        }optional{
            ?artista wdt:P27|wdt:P27/wdt:P1366 ?origin.
            ?origin wdt:P625 ?coord;
                    rdfs:label ?originLabel.
        }
        filter(lang(?originLabel)="en").
        optional{
            ?artista wdt:P166 ?premi.
            ?premi rdfs:label ?premiLabel.
            FILTER(lang(?premiLabel) = "en").
        }
    }
    LIMIT ${limit}`;
    
const getInfoArtistaByCodiciWikidata =  (codiceArtista,limit) =>
    `select distinct ?artista ?image ?startWork ?originLabel ?coord ?premi ?premiLabel where {
        VALUES ?artista { ${codiceArtista.map(q => `wd:${q}`).join(" ")} }.
        optional{
            ?artista wdt:P569|wdt:P571 ?startWork;
        }
        optional{
            ?artista wdt:P19|wdt:P19/wdt:P1366 ?origin.
            ?origin wdt:P625 ?coord;
                    rdfs:label ?originLabel.
        }
        optional{
            ?artista wdt:P740|wdt:P740/wdt:P1366 ?origin.
            ?origin wdt:P625 ?coord;
                    rdfs:label ?originLabel.
        }
        optional{
            ?artista wdt:P495|wdt:P495/wdt:P1366 ?origin.
            ?origin wdt:P625 ?coord;
                    rdfs:label ?originLabel.
        }optional{
            ?artista wdt:P27|wdt:P27/wdt:P1366 ?origin.
            ?origin wdt:P625 ?coord;
                    rdfs:label ?originLabel.
        }
        filter(lang(?originLabel)="en").
        optional{
            ?artista wdt:P166 ?premi.
            ?premi rdfs:label ?premiLabel.
            FILTER(lang(?premiLabel) = "en").
        }
    }
    LIMIT ${limit}`;

/*`
select distinct ?artista ?image ?startWork ?coord where {
    ?artista wdt:P1902 "${codiceArtista}";
             wdt:P18 ?image;
             wdt:P2031|wdt:P571 ?startWork;
             wdt:P136 ?genere;
             wdt:P495|wdt:P740 ?origin.
  
   ?origin wdt:P625 ?coord.
         # dbo:birthDate ?birtDate;
         # dbo:birthPlace ?birtPlace.
         # ?birtPlace georss:point ?coord.
} LIMIT 100`*/

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


const findSongByCodiciArtistAndSongName=(codiciArtisti,nomeCanzone="")=>`
SELECT DISTINCT  ?artista  ?canzoni  WHERE {
    values ?artista {${codiciArtisti.map(q => `wd:${q}`).join(" ")}}.
    {
        ?artista  wdt:P358/wdt:P2354/wdt:P658| wdt:P1455|wdt:P800|wdt:P800/wdt:P527|wdt:P264/wdt:P358/wdt:P2354/wdt:P527/wdt:P658 ?canzoni.
    }
    UNION{
            ?canzoni (wdt:P86|wdt:P175|wdt:P162)/wdt:P658|(wdt:P86|wdt:P175|wdt:P162)  ?artista;
    }
    ?canzoni rdfs:label ?canzoniLabel.
    ${nomeCanzone===""?"":`FILTER(REGEX(?canzoniLabel, "${nomeCanzone}", "i") || REGEX("${nomeCanzone}", ?canzoniLabel, "i")).`}
}limit 100
`;

//const getInfoCanzoniById
const getInfoCanzoneByLabels=(idCanzoni,limit=100,all=true)=>`
SELECT distinct  ?canzoni ?canzoniLabel ?pubblicazione ${all?`?artista ?artistaLabel ?genere ?genereLabel ?album ?albumLabel`:""} WHERE {
    VALUES ?canzoni { ${idCanzoni.map(q => `wd:${q}`).join(" ")} }.
     {
        ?artista  wdt:P358/wdt:P2354/wdt:P658| wdt:P1455|wdt:P800|wdt:P800/wdt:P527|wdt:P264/wdt:P358/wdt:P2354/wdt:P527/wdt:P658 ?canzoni.
    }
    UNION{
        ?canzoni (wdt:P86|wdt:P175|wdt:P162)/wdt:P658|(wdt:P86|wdt:P175|wdt:P162)  ?artista.
    } 
    ?canzoni wdt:P577| wdt:P361/wdt:P577 | wdt:P1433/wdt:P577 ?pubblicazione${all?
            `wdt:P136| wdt:P361/wdt:P136 | wdt:P1433/wdt:P136 ?genere;
            wdt:P361|wdt:P1433 ?album.`:"."
    }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT ${limit}`;

const getPubblicazioneAlbum=(codiciAlbum)=>
    `SELECT distinct ?codice ?dataPubblicazione WHERE {
        values ?album {${codiciAlbum.map(q => `wd:${q}`).join(" ")}}.
        ?album wdt:P577 ?dataPubblicazione;
        optional{
         ?album wdt:P2205 ?codice;.
         }
      }
    `;

module.exports = {getPubblicazioneAlbum,getQueryCanzoniMusicista,getInfoArtistaByIdSpotify,getInfoArtistaByCodiciWikidata,getQueryCanzone,getElement,getInfoCanzoneByLabels,getQueryCanzoniFatteDaId,findSongByCodiciArtistAndSongName};