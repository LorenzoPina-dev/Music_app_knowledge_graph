const https = require('https');
const fs = require('fs');
const url="https://";
let query=`SELECT ?item (YEAR(?chart_year) AS ?year) ?ranking (SAMPLE(?youtube_video_candidate) AS ?youtube_video) WHERE {
  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en".
    ?performer rdfs:label ?performerLabel  
  }
  ?item wdt:P31/wdt:P279* wd:Q2188189.
  ?item p:P2291 ?charted_in.
  OPTIONAL { ?item wdt:P1651 ?youtube_video_id }.
  BIND(CONCAT("https://www.youtube.com/watch?v=", ?youtube_video_id) AS ?youtube_video_candidate).
  ?charted_in ps:P2291 ?chart.
  ?charted_in pq:P1352 ?ranking.
  ?chart wdt:P459 wd:Q17036134.
  ?chart wdt:P585 ?chart_year.
}
GROUP BY ?item ?charted_in ?chart ?ranking ?chart_year
ORDER BY DESC(?year) ASC(?ranking)`;

query=`SELECT DISTINCT ?property ?propertyLabel
WHERE {
  # Trova entità che sono cantanti
  ?singer wdt:P31 wd:Q177220 ;   # P31 = "istanza di", Q177220 = "cantante"
          ?property ?value .

  # Ottieni l'etichetta della proprietà
  SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en". }
}
ORDER BY ?propertyLabel
LIMIT 100

`;
query=`SELECT DISTINCT ?property  ?propertyDescription
WHERE {
  # Trova entità che sono istanze di "cantante"
  ?singer wdt:P31 wd:Q177220 ;   # P31 = "istanza di", Q177220 = "cantante"
          ?property ?value .     # Recupera tutte le proprietà usate

  # Ottieni etichette e descrizioni delle proprietà
  SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en". }
}
ORDER BY ?property
LIMIT 100

`;

const options = {
    hostname: 'query.wikidata.org',
    port: 443,
    path: "/sparql?query="+encodeURIComponent(query)+"&format=json",
    method: 'GET',
    headers: {
        'User-Agent': 'MyApp/1.0 (myemail@example.com)',
        'Content-Type': 'application/sparql-results+json',
    },
  };

  let property=[];

// Make the request
https.get(options, (response) => {
  let data = '';

  // Collect the response data
  response.on('data', (chunk) => {
    data += chunk;
  });

  // Process the response once complete
  response.on('end', () => {
    try {
        fs.writeFileSync('example3.txt', data);
        console.log('File written successfully!');
      } catch (err) {
        console.error('Error writing to file:', err);
      }
      let json=JSON.parse(data);
      let binding=json.results.bindings;
      for(let i=0;i<binding.length;i++){
        let v=binding[i].property["value"].split("/").pop().replace("Q","");
        property.push(v);
      }
     // console.log("Proprietà recuperate: ",property);
      makeRequests(property);
  });

}).on('error', (err) => {
  console.error('Error:', err.message);
});

function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url["url"], (res) => {
      let data = '';
      
      // Ricevi i dati dalla risposta
      res.on('data', chunk => {
        data += chunk;
      });
      // Quando la risposta è completa, risolvi la promessa
      res.on('end', () => {
        let nome=JSON.parse(data);
        resolve(nome);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}


/*
const propName = `SELECT ?propertyLabel WHERE {
  wd:${codiceProperta} rdfs:label ?propertyLabel.
  FILTER(LANG(?propertyLabel) = "en")
}`;
*/
function creaOption(propName,lingua) {
  const propQuery = `SELECT ?propertyLabel WHERE {wd:${propName} rdfs:label ?propertyLabel. FILTER(LANG(?propertyLabel) = "${lingua}")}`;
  const path = "/sparql?query="+encodeURIComponent(propQuery)+"&format=json";
  const options2 = {
    hostname: 'query.wikidata.org',
    port: 443,
    path: path,//`/wiki/Special:EntityData/${codiceProperta}.json`,
    method: 'GET',
    headers: {
        'User-Agent': 'MyApp/1.0 (myemail@example.com)',
        'Content-Type': 'application/sparql-results+json',
    },
  };
  return {url:options2, propQuery:propName};
}
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequests(property) {
  const requests=property.map(p => creaOption(p,"it"));
  let results =[];
  for (let i = 0; i < requests.length; i++) {
    try {
      let ris= await fetchData(requests[i]);
      results.push(ris.results.bindings[0].propertyLabel.value);
      if (i < requests.length - 1) {
        await delay(20); // Delay di 1 secondo
      }
    } catch (error) {
      console.error('Errore durante la richiesta:', error);
    }
  }
  try {
    fs.writeFileSync('proprieta.txt', JSON.stringify( results,null,2));
    console.log('File written successfully!');
  } catch (err) {
    console.error('Error writing to file:', err);
  }
/*
  try {
    // Esegui tutte le chiamate in parallelo con Promise.all()
    const results = await Promise.all(requests.map(url => fetchData(url)));
    
    // `results` è un array contenente le risposte di tutte le chiamate
    //console.log(results);  // Stampa tutti i risultati
  } catch (error) {
    console.error('Errore durante la chiamata HTTP:', error);
  }*/
}