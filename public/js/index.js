class SPARQLQueryDispatcher {
	constructor( endpoint ) {
		this.endpoint = endpoint;
	}

	query( sparqlQuery ) {
		const fullUrl = this.endpoint + '?query=' + encodeURIComponent( sparqlQuery );
		const headers = { 'Accept': 'application/sparql-results+json' };

		return fetch( fullUrl, { headers } ).then( body => body.json() );
	}
}

const start = 0,
      end = 5000;

let content = null;

async function fetchJson(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Errore HTTP! Status: ${response.status}`);
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Errore nella richiesta:", error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    content = document.getElementById("content");
    fetchJson(`/api/getNplaylist?max=${end}&start=${start}`)
        .then(data => content.appendChild(build_table(data)))
        .catch(err => console.error(err));
});

function build_table(arr) {
    const table = document.createElement("table");

    for (let i = 0; i < arr.length; i++) {
        const tr = document.createElement("tr"), td = document.createElement("td"), a = document.createElement("a");
        const name = arr[i].name;
        a.textContent = name;
        a.href = `/playlist.html?idPlaylist=${arr[i].pid}&nomePlaylist=${name}&useSpotify=${false}`;

        td.appendChild(a);
        tr.appendChild(td);
        table.appendChild(tr);
    }
    return table;
}

function generaPaginaPlaylist(idPlaylist) {
    content=document.getElementById("content");
    content.replaceChildren();

}

function getDataWAutore(codiceArtista){ 
    const endpointUrl = 'https://query.wikidata.org/sparql';
    const sparqlQuery = `SELECT ?artista ?canzoni ?genere ?pubblicazione WHERE {
        ?artista wdt:P1902 "${codiceArtista}".
        ?canzoni wdt:P175 ?artista ;
                wdt:P136 ?genere ;
                wdt:P577 ?pubblicazione.
    }`;

    const queryDispatcher = new SPARQLQueryDispatcher( endpointUrl );
    queryDispatcher.query( sparqlQuery ).then( console.log );

}

function getDataWSong(codiceCanzone){

}