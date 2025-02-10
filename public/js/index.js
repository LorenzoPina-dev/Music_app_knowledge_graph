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
    } 
    catch (error) {
        console.error("Errore nella richiesta:", error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    fetchJson(`/api/getNplaylist?max=${end}&start=${start}`)
        .then(data => renderData(data))
        .catch(err => console.error(err));
});

function renderData(arr) {
    const container = document.getElementById("container"),
          h1 = document.createElement("h1");
    console.log(arr)
    h1.textContent = "Playlists";
    document.body.prepend(h1);
    for (let i = 0; i < arr.length; i++) {
        const div = document.createElement("div"), a = document.createElement("a");
        const name = arr[i].name;
        a.textContent = name;
        a.href = `/playlist.html?idPlaylist=${arr[i].pid}&nomePlaylist=${name}`;

        div.appendChild(a);
        container.appendChild(div);
    }
}

function getDataWAutore(codiceArtista) { 
    const endpointUrl = 'https://query.wikidata.org/sparql',
          sparqlQuery = `SELECT ?artista ?canzoni ?genere ?pubblicazione WHERE {
        ?artista wdt:P1902 "${codiceArtista}".
        ?canzoni wdt:P175 ?artista ;
                wdt:P136 ?genere ;
                wdt:P577 ?pubblicazione.
    }`;

    const queryDispatcher = new SPARQLQueryDispatcher( endpointUrl );
    queryDispatcher.query( sparqlQuery ).then( console.log );

}