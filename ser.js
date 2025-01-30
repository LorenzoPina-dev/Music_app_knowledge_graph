const https = require('https');
const fs = require('fs');

const wikydata="query.wikidata.org";


function fetchData(url,parse) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(parse?JSON.parse(data):data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function creaOption(path,destinazione) {
  return{
    hostname: destinazione,
    port: 443,
    path: path,
    method: 'GET',
    headers: {
        'User-Agent': 'MyApp/1.0 (myemail@example.com)',
        'Content-Type': 'application/sparql-results+json',
    },
  };
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequests(querys,callback,lingua="en") {
  let results =[];
  for (let i = 0; i < querys.length; i++) {
    try {
      let ris= await fetchData(querys[i],true);
      console.log(callback(ris));
      results.push(callback(ris));
      if (i < querys.length - 1) {
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
}

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


function getAttwikipedia(){
  fetchData(creaOption("/sparql?query="+encodeURIComponent(query)+"&format=json",wikydata),true) .then((dati) => {
    
    let property=[];
    let binding=dati.results.bindings;
    for(let i=0;i<binding.length;i++){
      let v=binding[i].property["value"].split("/").pop().replace("Q","");
      property.push(v);
    }
    console.log(property);
    let lingua="en";
  querys=property.map(p => {
    let query=`SELECT ?propertyLabel WHERE {wd:${p} rdfs:label ?propertyLabel. FILTER(LANG(?propertyLabel) = "${lingua}")}`;
    return creaOption("/sparql?query="+encodeURIComponent(query)+"&format=json",wikydata)});
    
  // console.log("Proprietà recuperate: ",property);
    makeRequests(querys,function(d){return d.results.bindings[0].propertyLabel.value});


  })
  .catch((error) => {
    console.error(error);
  });
}

function getCsvFields(filePath) {
  // Legge il file CSV
  const data = fs.readFileSync(filePath, 'utf8');
  
  // Estrae la prima riga (header)
  const lines = data.split('\n'); // Divide per righe
  const header = lines[0];        // La prima riga contiene i campi
  
  // Divide la riga per i separatori di colonna (ad esempio ',')
  const fields = header.split(','); // Cambia ',' se usi un altro separatore
  
  return fields;
}

function getAttMusicDataset(){
  let campi=getCsvFields("music_dataset.csv");
  try {
    fs.writeFileSync('proprieta_music_database.txt', JSON.stringify( campi,null,2));
    console.log('File written successfully!');
  } catch (err) {
    console.error('Error writing to file:', err);
  }
  console.log(campi);
}
//getAttwikipedia();
getAttMusicDataset();
/*try {
    fs.writeFileSync('example3.txt', dati);
    console.log('File written successfully!');
  } catch (err) {
    console.error('Error writing to file:', err);
  }*/

  