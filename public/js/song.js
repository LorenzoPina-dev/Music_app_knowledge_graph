let codA;
let nomCanzone;

document.addEventListener("DOMContentLoaded", function () {
    let url=new URL(window.location.href);
    const codiceArtista = url.searchParams.get('idAutore');
    let nomeCanzone = url.searchParams.get('nomeSong');
    codA = codiceArtista;
    nomCanzone=nomeCanzone;
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
    
    let aAutor=document.getElementById("aArtista");
    let aAlbum=document.getElementById("aAlbum");
    let dataPubb=document.getElementById("dataPubblicazione");
    dataPubb.innerHTML=data[0].pubblicazione.value;
    aAutor.href=`/artist.html?idAutore=${codA}`;
    aAlbum.href=`/album.html?idAutore=${codA}&idAlbum=${data[0].album.value}`;
    aAutor.innerHTML=data[0].artistaNome.value;
    aAlbum.innerHTML=data[0].album.value;
    let divGeneri=document.getElementById('divgeneri');
    divGeneri.innerHTML=''; // Clean previous content
    data.forEach(e => {
        console.log(e);
        let h3=document.createElement('h3');
        h3.innerHTML=e.nomeGenere.value;
        divGeneri.appendChild(h3);
    });
}