
const https = require('https');

function fetchData(url, parse) {
    return new Promise((res, rej) => {
        https.get(url, response => {
            let data = "";
            response.on("data", chunk => {
                data += chunk;
            });

            response.on("end", () => {
                res(parse ? JSON.parse(data) : data);
            });
        }).on("error", err => {
            rej(err);
        });
    });
}

function creaOption(path, destinazione) {
    return {
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

async function makeRequests(querys, callback) {
    const results =[];
    for (let i = 0; i < querys.length; i++) {
        try {
            const ris = await fetchData(querys[i],true);
            //console.log(callback(ris));
            results.push(callback(ris));
            if (i < querys.length - 1) {
                await delay(20); // Delay di 1 secondo
            }
        } 
        catch (err) {
            console.error('Errore durante la richiesta:', err);
        }
    }
    try {
        fs.writeFileSync('proprieta.txt', JSON.stringify(results,null,2));
        console.log('File written successfully!');
    } 
    catch (err) {
        console.error('Error writing to file:', err);
    }
}

module.exports = {makeRequests, delay, creaOption,fetchData}