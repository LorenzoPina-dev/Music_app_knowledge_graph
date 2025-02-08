let ris = null;

document.addEventListener("DOMContentLoaded", async function () {
    let url = new URL(window.location.href);

    const idAlbum = url.searchParams.get('idAlbum');

    let urlApi = `http://localhost:3000/api/spotify/album/?idAlbum=${idAlbum}`;


    fetch(urlApi)
        .then(response => response.json()) // Parse response as JSON
        .then(data => ris = data.body)
        //.then(data => renderData(data, nomePlaylist, useSpotify)) // Handle the data
        .catch(error => console.error('Error:', error)); // Handle errors
});