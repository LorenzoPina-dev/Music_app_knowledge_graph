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
            var div = document.createElement("div");
            div.innerHTML = `<h2>${p.name}</h2>
                            <h3>${p.num_tracks}</h3> `;
            content.appendChild(div);
    });
}).catch(err =>console.error(err));
    
});