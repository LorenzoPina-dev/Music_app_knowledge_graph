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

const maxPlaylistPerPage=48;
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

document.addEventListener("DOMContentLoaded", async function () {
    const url = new URL(window.location.href),
        filtro = url.searchParams.get('filtro') ?? '',
        offset = Number(url.searchParams.get('offset')) ?? 0,
        limit=(await fetchJson(`/api/numeroPlaylist`)).numPlaylist;
    fetchJson(`/api/getNplaylist?max=${200}&start=${offset}&filtro=${filtro}`)
        .then(data => renderData(data,filtro,offset,maxPlaylistPerPage,limit))
        .catch(err => console.error(err));
});

function renderData(arr,filtro,offset,numPlaylistPagina,totalePlaylist) {
    const container = document.createElement("div"),
          h1 = document.createElement("h1");
    container.id="container";
    h1.textContent = "Playlists";
    document.body.prepend(h1);
    for (let i = 0; i < Math.min(arr.length,numPlaylistPagina); i++) {
        const div = document.createElement("div"), a = document.createElement("a");
        const name = arr[i].name;
        a.textContent = name;
        a.href = `/playlist.html?idPlaylist=${arr[i].pid}&nomePlaylist=${name}`;

        div.appendChild(a);
        container.appendChild(div);
    }

    if (arr.length > numPlaylistPagina) {

        const navigate = document.createElement("div"),
            left_button = document.createElement("div"),
            left_a = document.createElement("a"),
            right_button = document.createElement("div"),
            right_a = document.createElement("a");

        navigate.classList.add("navigate");

        const left_limit = offset - numPlaylistPagina < 0 ? 0 : offset - numPlaylistPagina,
              right_limit = offset + numPlaylistPagina;
        left_a.textContent = "<";
        right_a.textContent = ">";

        const back = e => e.button === 0 ? window.location.assign(`/index.html?${filtro===""?"":`filtro=${encodeURIComponent(filtro)}&`}offset=${left_limit}`) : void 0,
              forward = e => e.button === 0 ? window.location.assign(`/index.html?${filtro===""?"":`filtro=${encodeURIComponent(filtro)}&`}offset=${right_limit}`) : void 0;

        if (offset !== 0)
            left_button.onmouseup = back;
        else
            left_button.classList.add("blocked");

        if (right_limit < totalePlaylist)
            right_button.onmouseup = forward;
        else
            right_button.classList.add("blocked");

        left_button.appendChild(left_a);
        right_button.appendChild(right_a);

        navigate.appendChild(left_button);
        navigate.appendChild(right_button);

        const navigate_clone = navigate.cloneNode(true);

        navigate_clone.firstChild.onmouseup = left_button.onmouseup;  
        navigate_clone.lastChild.onmouseup = right_button.onmouseup;

        window["test"] = navigate_clone;

        document.body.appendChild(navigate);

        document.body.appendChild(container);

        document.body.appendChild(navigate_clone);
    }
    else {
        document.body.appendChild(container);
    }
}

