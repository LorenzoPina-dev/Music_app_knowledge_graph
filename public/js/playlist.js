document.addEventListener("DOMContentLoaded", function () {
    let url = new URL(window.location.href);

    const idPlaylist = url.searchParams.get('idPlaylist'),
          nomePlaylist = url.searchParams.get('nomePlaylist'),
          useSpotify = url.searchParams.get('useSpotify') === true;

    let urlApi;
    if (useSpotify) 
        urlApi = `http://localhost:3000/api/spotify/playlist/?idPlaylist=${idPlaylist}`;
    else
        urlApi = `http://localhost:3000/api/getSongPlaylist?idPlaylist=${idPlaylist}`;

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

        let artist, album;
        if (useSpotify) {
            artist = s.artists[0].id;
            album = s.album.name;
        }
        else {
            artist = s.artist_uri.slice("spotify:artist:".length);
            album = encodeURIComponent(s.album_name);
        }

        a_song.href = `/song.html?nomeSong=${encodeURIComponent(s.track_name)}&idAutore=${artist}`;
        a_song.textContent = s.track_name;
        td_song.appendChild(a_song);

        a_album.href = `/album.html?idAutore=${artist}&idAlbum=${album}`;
        a_album.textContent = s.album_name;
        td_album.appendChild(a_album);

        a_autor.href = `/artist.html?idAutore=${artist}`;
        a_autor.textContent = s.artist_name;
        td_autor.appendChild(a_autor);
        
        tr.appendChild(td_song);
        tr.appendChild(td_album);
        tr.appendChild(td_autor);

        table.appendChild(tr);
    }
    document.body.appendChild(table);
}