function FormatArtistName(name) {
    if (name.match(/[^\x00-\x7F]/g) !== null) {
        // trova nome in inglese tra le tonde
        const m = name.match(/\(([^)]+)\)/);
        name = m !== null ? m[1] : name;
    }
    name = name.replace(/[^\x00-\x7F]/g, "");
    const indexes = [name.indexOf("-"), name.indexOf("("), name.indexOf("["), name.indexOf("/")].filter(v => v !== -1);
    if (indexes.length !== 0) {
        const cut_index = Math.min(indexes);
        name = name.slice(0, cut_index-1);
    }
    name = name.replace(/^\s+|\s+$/g, "");
    return name;
}

function FormatSongName(name) {
    if (name.match(/[^\x00-\x7F]/g) !== null) {
        // trova nome in inglese tra le tonde
        const m = name.match(/\(([^)]+)\)/);
        name = m !== null ? m[1] : name;
    }
    name = name.replace(/[^\x00-\x7F]/g, "");
    const indexes = [name.indexOf("-"), name.indexOf("("), name.indexOf("["), name.indexOf("/"), name.indexOf(":")].filter(v => v !== -1);
    if (indexes.length !== 0) {
        const cut_index = Math.min(indexes);
        name = name.slice(0, cut_index-1);
    }
    name = name.replace(/^\s+|\s+$/g, "");
    return name;
}

let songs;
document.addEventListener("DOMContentLoaded", function () {
    let url = new URL(window.location.href);

    const idPlaylist = url.searchParams.get('idPlaylist'),
          nomePlaylist = url.searchParams.get('nomePlaylist'),
          useSpotify = url.searchParams.get('useSpotify') == "true";
    console.log( url.searchParams.get('useSpotify'));
    let urlApi;
    if (useSpotify) 
        urlApi = `http://localhost:3000/api/spotify/playlist/?idPlaylist=${idPlaylist}`;
    else
        urlApi = `http://localhost:3000/api/getSongPlaylist?idPlaylist=${idPlaylist}`;
    console.log(urlApi);
    fetch(urlApi)
        .then(response => response.json()) // Parse response as JSON
        .then(data => renderData(data, nomePlaylist, useSpotify)) // Handle the data
        .catch(error => console.error('Error:', error)); // Handle errors
});

function renderData(data, title, useSpotify) {
    //console.log(data)
    songs = data;

    Promise.all(songs.map(async e => {
        const artista = e.artist_uri.split(":")[2],
              nomeArtista = FormatArtistName(e.artist_name),
              nomeCanzone = FormatSongName(e.track_name);

        let urlApi = `http://localhost:3000/api/wikidata/elemento?stringa=${encodeURIComponent(artista)}`,
              ris = await fetch(urlApi);

        let artisti = (await ris.json()).map(p => p.title);
        if (artisti.length === 0) {
            urlApi = `http://localhost:3000/api/wikidata/elemento?stringa=${encodeURIComponent(nomeArtista)}`;
            ris = await fetch(urlApi);
            artisti = (await ris.json()).map(p => p.title);
        }
        
        urlApi = `http://localhost:3000/api/wikidata/songByIdArtisti`;
        ris = await fetch(urlApi, { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ codiciArtisti: artisti,nomeCanzone:nomeCanzone }) 
        });
        
        const canzoniTrovate = await ris.json();
        //console.log(infoCanzoni);
       /* const canzoniTrovate=canzoniTrovate.filter(canzoni =>{
           let nc= canzoni.nomeCanzone.value.toLowerCase();
           let ns=nomeCanzone.toLowerCase();
           return nc.includes(ns)||ns.includes(nc);

        });*/
        //console.log(canzoniTrovate);
        if (canzoniTrovate.length === 0) {
            console.log({ nomeArt: nomeArtista, nomeCanzone: nomeCanzone, art: artisti, info:canzoniTrovate });
        }
       /* urlApi = `http://localhost:3000/api/wikidata/elemento?stringa=${encodeURIComponent(nomeCanzone)}`;
        ris = await fetch(urlApi);
        const canzoni = (await ris.json()).map(p => p.title);


        urlApi = `http://localhost:3000/api/wikidata/songById`;
        ris = await fetch(urlApi, { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ codiciCanzoni: canzoni, codiciArtisti: artId}) 
        });
        
        const infoCanzoni = await ris.json();
        if (infoCanzoni.length == 0) {
            console.log({ nomeArt: e.artist_name, nomeCanzone: nomeCanzone, art: art, canzoni: canzoni,info:infoCanzoni,artId:artId });
        }*/
    })).then(_ => console.log("fatto"));

    const table = document.createElement("table"),
          first_tr = document.createElement("tr"),
          th = document.createElement("th");

    th.textContent = title;
    th.colSpan = 3;

    first_tr.appendChild(th);
    table.appendChild(first_tr);

    for (let i=0; i<data.length; i++) {
        const tr = document.createElement("tr"),
              td_song = document.createElement("td"),
              a_song = document.createElement("a"),
              td_autor = document.createElement("td"),
              a_autor = document.createElement("a"),
              td_album = document.createElement("td"),
              a_album = document.createElement("a");

        const s = data[i];

        let artist, album,song,albumId,artistId;
        if (useSpotify) {
            artistId = s.artists[0];
            album = s.album;
            song = s.name;
            albumId = album;
            artist = artistId;
        }
        else {
            artistId = s.artist_uri.slice("spotify:artist:".length);
            albumId = s.album_uri.slice("spotify:album:".length);
            song = s.track_name;
            album = s.album_name;
            artist = s.artist_name;
        }

        a_song.href = `/song.html?nomeSong=${encodeURIComponent(song)}&idAutore=${artistId}`;
        a_song.textContent = song;
        td_song.appendChild(a_song);

        a_album.href = `/album.html?idAlbum=${albumId}`;
        a_album.textContent = album;
        td_album.appendChild(a_album);

        a_autor.href = `/artist.html?idAutore=${artistId}`;
        a_autor.textContent = artist;
        td_autor.appendChild(a_autor);
        
        tr.appendChild(td_song);
        tr.appendChild(td_album);
        tr.appendChild(td_autor);

        table.appendChild(tr);
    }
    document.body.appendChild(table);
}