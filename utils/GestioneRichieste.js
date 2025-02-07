
const https = require('https');

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
      console.error('Error:', err);
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
        'Content-Type': 'application/sparql-results+json',
    },
  };
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequests(querys,callback) {
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

module.exports = {makeRequests, delay, creaOption,fetchData}