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


var playlists=[];
var songs=[];
let start=0;
let end=50;
var content=null;
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
    content=document.getElementById("content");
    fetchJson(`/api/getNplaylist?end=${end}&start=${start}`).then( data=> {
        playlists=data;
        playlists.forEach(p => {
        console.log(p);
            var div = document.createElement("div");
            var a= document.createElement("a");
            a.href = `/songs.html?idPlaylist=${p.pid}&nomePlaylist=${p.name}&useSpotify=${false}`;
            a.innerHTML = `<h2>${p.name}</h2>
            <h3>${p.num_tracks}</h3> `;
            div.appendChild(a);
            content.appendChild(div);
    });
}).catch(err =>console.error(err));
    
});

function generaPaginaPlaylist(idPlaylist) {
    content=document.getElementById("content");
    content.replaceChildren();

}


function build_table_from_obj(obj) {
    const name = format_uri(obj.__metadata.uri); //nome playlist
    // __metadata just points to the original uri;
    const table = document.createElement("table"), th_title = document.createElement("th"), th_back = document.createElement("th");
    const history_length = kb_history.length;
    if (history_length > 0) {
        th_back.textContent = "back";
        th_back.onmouseup = go_back_mouseup;
        th_back.onmouseover = go_back_mouseover;
    }
    const first_tr = document.createElement("tr");
    first_tr.appendChild(th_back);
    th_title.textContent = name;
    th_title.title = uri;//nome
    first_tr.appendChild(th_title);
    table.appendChild(first_tr);
    for (let i = 0; i < field_count; i++) {
        const field_key = fields[i], field_name = format_field(field_key), field_val = obj[field_key];
        if (field_name === "abstract" || field_name === "rdf-schema#comment" || field_name === "owl#sameAs") {
            // no need for the paragraph of text (abstract and rdf-schema#comment), since it's written in an arbitrary language;
            // owl#sameAs returns a CORS error when traversed, also it's redundant (because it points to an equivalent uri).
            continue;
        }
        const tr = document.createElement("tr"), td_field_name = document.createElement("td"), td_field_value = document.createElement("td");
        td_field_name.textContent = field_name;
        td_field_name.title = field_key;
        if (typeof field_val === "string") {
            td_field_value.textContent = decodeHtmlText(field_val);
        }
        else {
            const links_to = field_val.__deferred.uri;
            td_field_value.textContent = links_to;
            if (links_to.includes('dbpedia')) {
                td_field_value.classList.add("internal-url");
                td_field_value.onmouseup = traverse_internal_link_mouseup;
            }
            else {
                td_field_value.classList.add("external-url");
                td_field_value.onclick = traverse_external_link_mouseup;
            }
        }
        tr.appendChild(td_field_name);
        tr.appendChild(td_field_value);
        table.appendChild(tr);
    }
    return { table, name };
}


function traverse_internal_link_mouseup(evt) {
    const td_link = evt.target, adjusted_link = adjust_link(td_link.textContent);
    // to prevent adding the same last entry to the kb_history
    if (adjusted_link !== kb_history[kb_history.length - 1]) {
        parse_and_render_request(adjusted_link);
    }
}

function getDataWAutore(codiceArtista){
    
const endpointUrl = 'https://query.wikidata.org/sparql';
const sparqlQuery = `SELECT ?artista ?canzoni  ?genere ?pubblicazione  WHERE {
  ?artista wdt:P1902 "${codiceArtista}".
          ?canzoni wdt:P175  ?artista.
          ?canzoni   wdt:P136 ?genere.
       ?canzoni     wdt:P577 ?pubblicazione.
}`;

const queryDispatcher = new SPARQLQueryDispatcher( endpointUrl );
queryDispatcher.query( sparqlQuery ).then( console.log );

}
function getDataWSong(codiceCanzone){

}
//getDataWikidata("4r0GVpjSsKSR1biv4fOoa5").then(data=>console.log(data));