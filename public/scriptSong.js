document.addEventListener("DOMContentLoaded", function () {
    let url=new URL(window.location.href);
    const codiceArtista = url.searchParams.get('idAutore');
    let nomeCanzone = url.searchParams.get('nomeSong');
    console.log(codiceArtista);
    console.log(nomeCanzone);
    document.getElementById("nomeCanzone").innerHTML = nomeCanzone;
    if(nomeCanzone.indexOf(" - ") !== -1)
        nomeCanzone=nomeCanzone.split(" - ")[0];
    if(nomeCanzone.indexOf(" (feat") !== -1)
        nomeCanzone=nomeCanzone.split(" (feat")[0];
    console.log(nomeCanzone);
    let urlApi=`http://localhost:3000/api/wikidata/song?codiceArtista=${codiceArtista}&nomeCanzone=${encodeURIComponent(nomeCanzone)}`;
    fetch(urlApi)
        .then(response => response.json()) // Parse response as JSON
        .then(data => renderData(data)) // Handle the data
        .catch(error => console.error('Error:', error)); // Handle errors

});

function renderData(data){
    console.log(data);
    let content=document.getElementById("content");
    content.innerHTML='';
    data.forEach(e => {
        console.log(e);
        let songDiv=document.createElement("div");
        let aSong=document.createElement("a");
        let aAutor=document.createElement("a");
        let aAlbum=document.createElement("a");
        let artista;
        if(e.artists==undefined) {
            let a=e.artist_uri.split(":");
            artista=a[2];
        } else 
            artista=e.artists[0].id;
        let album;
        if(e.album==undefined) {
            let a=e.album_uri.split(":");
            album=a[2];
        } else 
            album=e.album.id;
        songDiv.classList.add("riga");
        aSong.href=`/song.html?nomeSong=${encodeURIComponent(e.track_name)}&idAutore=${artista}`;
        aAutor.href=`/artist.html?idAutore=${artista}`;
        aAlbum.href=`/album.html?idAutore=${artista}&idAlbum=${album}`;
        aSong.innerHTML=e.track_name;
        aAutor.innerHTML=e.artist_name;
        aAlbum.innerHTML=e.album_name;
        songDiv.appendChild(aSong);
        songDiv.appendChild(aAutor);
        songDiv.appendChild(aAlbum);
        content.appendChild(songDiv);
    });
}