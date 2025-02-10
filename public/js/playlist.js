let songs;
document.addEventListener("DOMContentLoaded", async function () {
    let url = new URL(window.location.href);

    const idPlaylist = url.searchParams.get('idPlaylist'),
          nomePlaylist = url.searchParams.get('nomePlaylist');

    const urlApi = `http://localhost:3000/api/getSongPlaylist?idPlaylist=${idPlaylist}`;
    
    fetch(urlApi)
        .then(response => response.json()) // Parse response as JSON
        .then(data => renderData(data, nomePlaylist)) // Handle the data
        .catch(error => console.error('Error:', error)); // Handle errors
});

function renderData(songs, title) {
    let i = 0;

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
        
        urlApi = `http://localhost:3000/api/wikidata/gettest`;
        ris = await fetch(urlApi, { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ codiciArtisti: artisti,nomeCanzone:nomeCanzone }) 
        });
        
        const canzoniTrovate = await ris.json();

        if (canzoniTrovate.length === 0) {
            console.log({ nomeArt: nomeArtista, nomeCanzone: nomeCanzone, art: artisti, info:canzoniTrovate });
            i++;
        }
    })).then(_ => {
        console.log("fatto");
        console.log(`${i} su ${songs.length} elementi non trovati`);
    });

    const table = document.createElement("table"),
          h1 = document.createElement("h1"),
          first_tr = document.createElement("tr"),
          th_song = document.createElement("th"),
          th_album = document.createElement("th"),
          th_duration = document.createElement("th");

    h1.textContent = `Playlist: ${title}`;
    document.body.prepend(h1);

    th_song.textContent = "# titolo";
    th_album.textContent = "album";
    th_duration.textContent = "durata";

    first_tr.appendChild(th_song);
    first_tr.appendChild(th_album);
    first_tr.appendChild(th_duration);

    table.prepend(first_tr);

    for (let i=0; i<songs.length; i++) {
        
        const tr = document.createElement("tr"),
              td_song = document.createElement("td"),
              a_song = document.createElement("a"),
              a_autor = document.createElement("a"),
              td_album = document.createElement("td"),
              a_album = document.createElement("a"),
              td_duration = document.createElement("td");

        const s = songs[i];

        //let artist, album,song,albumId,artistId;
        // if (useSpotify) {
        //     artistId = s.artists[0];
        //     album = s.album;
        //     song = s.name;
        //     albumId = album;
        //     artist = artistId;
        // }

        const artistId = s.artist_uri.slice("spotify:artist:".length),
              albumId = s.album_uri.slice("spotify:album:".length),
              song = s.track_name,
              songUri = s.track_uri.slice("spotify:track:".length),
              album = s.album_name,
              artist = s.artist_name;

        a_song.href = `/song.html?idCanzone=${songUri}`;
        a_song.textContent = song;
        td_song.appendChild(a_song);

        td_song.appendChild(document.createElement("br"));

        a_autor.href = `/artist.html?idAutore=${artistId}`;
        a_autor.textContent = artist;
        td_song.appendChild(a_autor);

        a_album.href = `/album.html?idAlbum=${albumId}`;
        a_album.textContent = album;
        td_album.appendChild(a_album);
        
        td_duration.textContent = formatMs(s.duration_ms);

        tr.appendChild(td_song);
        tr.appendChild(td_album);
        tr.appendChild(td_duration);

        table.appendChild(tr);
    }
    document.body.appendChild(table);
}