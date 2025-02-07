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

// album_name: "Reach Out I'll Be There"
// album_uri: "spotify:album:7KrwyjO26jw7TJaUcJvbz9"
// artist_name: "Four Tops"
// artist_uri: "spotify:artist:7fIvjotigTGWqjIz6EP1i4"
// duration_ms: 162960
// pos: 37
// track_name: "I Can't Help Myself (Sugar Pie, Honey Bunch) - Album Version (Stereo)"
// track_uri: "spotify:track:1I8956VUImfafRIuccR9Cq"

function renderData(data, title, useSpotify) {
    console.log(data)
    songs=data;

    Promise.all(songs.map(async e => {
        let artista = e.artist_uri.split(":")[2];
        let nomeArtista=e.artist_name;
        
        if( nomeArtista.match(/[^\x00-\x7F]/g)!=null) {
            const m=nomeArtista.match(/\(([^)]+)\)/);
            nomeArtista = m ? m[1] : nomeArtista;
        }
        nomeArtista =nomeArtista.replace(/[^\x00-\x7F]/g, "");
        nomeArtista =nomeArtista.replace(/^\s+|\s+$/g, "");        ;
        if (nomeArtista.includes(" -")) nomeArtista = nomeArtista.split(" -")[0];
        if (nomeArtista.includes(" (")) nomeArtista = nomeArtista.split(" (")[0];
        if (nomeArtista.includes(" [")) nomeArtista = nomeArtista.split(" [")[0];
        if (nomeArtista.includes(" /")) nomeArtista = nomeArtista.split(" /")[0];
        let nomeCanzone = e.track_name;
        if( nomeCanzone.match(/[^\x00-\x7F]/g)!=null) {
            const m=nomeCanzone.match(/\(([^)]+)\)/);
            nomeCanzone = m ? m[1] : nomeCanzone;
        }
        nomeCanzone =nomeCanzone.replace(/[^\x00-\x7F]/g, "");
        nomeCanzone =nomeCanzone.replace(/^\s+|\s+$/g, "");        ;
        if (nomeCanzone.includes(" -")) nomeCanzone = nomeCanzone.split(" -")[0];
        if (nomeCanzone.includes(" (")) nomeCanzone = nomeCanzone.split(" (")[0];
        if (nomeCanzone.includes(" [")) nomeCanzone = nomeCanzone.split(" [")[0];
        if (nomeCanzone.includes(" /")) nomeCanzone = nomeCanzone.split(" /")[0];


        urlApi = `http://localhost:3000/api/wikidata/elemento?stringa=${encodeURIComponent(artista)}`;
        ris = await fetch(urlApi);
        let artisti = (await ris.json()).map(p => p.title);
        if(artisti.length == 0) {
            let urlApi = `http://localhost:3000/api/wikidata/elemento?stringa=${encodeURIComponent(nomeArtista)}`;
            let ris = await fetch(urlApi);
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
        if (canzoniTrovate.length == 0) {
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
    })).then(()=>console.log("fatto"));
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
            song=s.name;
            albumId=album;
            artist=artistId;
        }
        else {
            artistId = s.artist_uri.slice("spotify:artist:".length);
            albumId= encodeURIComponent(s.album_name);
            song=s.track_name;
            album=s.album_name;
            artist=s.artist_name;
        }

        a_song.href = `/song.html?nomeSong=${encodeURIComponent(song)}&idAutore=${artistId}`;
        a_song.textContent = song;
        td_song.appendChild(a_song);

        a_album.href = `/album.html?idAutore=${artistId}&idAlbum=${albumId}`;
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