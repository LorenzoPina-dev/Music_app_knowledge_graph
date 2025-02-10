let ris = null;

/**
 * name
 * artists: [{ id, name }]
 * tracks: [{ id, name, duration_ms,  }]
 * total = number of tracks
 * release_date: "2015-02-24"
​ * release_date_precision: "day"
 */

document.addEventListener("DOMContentLoaded", async function () {
    let url = new URL(window.location.href);

    const idAlbum = url.searchParams.get('idAlbum');

    let urlApi = `http://localhost:3000/api/spotify/album/?idAlbum=${idAlbum}`;

    fetch(urlApi)
        .then(response => response.json()) // Parse response as JSON
        .then(data => renderData(data.body))
        //.then(data => renderData(data, nomePlaylist, useSpotify)) // Handle the data
        //.catch(error => console.error('Error:', error)); // Handle errors
});



//Nome album
//Artista
//Pubblicazione
//Durata
//Tracce

/**
 * Artista: []

 * Tracce: []
 */
function renderData(album) {
    const overview_table = document.createElement("table"),
          tr_album_name = document.createElement("tr"),
          th_album_name = document.createElement("th"),
          tr_artists =  document.createElement("tr"),
          tr_pubblication_date = document.createElement("tr"),
          td_pubblication_date = document.createElement("td"),
          tr_duration = document.createElement("tr"),
          td_duration = document.createElement("td"),
          tracks_table = document.createElement("table"),
          tr_tracks = document.createElement("tr"),
          th_tracks_name = document.createElement("th"),
          th_tracks_duration = document.createElement("th");

    const album_img = document.createElement("img");
    album_img.src = album.images[1].url;
    document.body.appendChild(album_img);

    overview_table.classList.add("overview");
    tracks_table.classList.add("tracks");

    const max_col_span = album.artists.length;
    document.documentElement.style.setProperty('--artist-count', max_col_span.toString());

    let total_duration = 0;

    const album_name = album.name;

    th_album_name.textContent = `Album: ${album_name}`;
    th_album_name.colSpan = max_col_span;

    tr_album_name.appendChild(th_album_name);
    overview_table.appendChild(tr_album_name);

    tr_artists.classList.add("artists");

    const artists = album.artists;
    for (let i=0; i<artists.length; i++) {
        const td = document.createElement("td"),
              a = document.createElement("a");

        const artist_name = artists[i].name,
              artist_id = artists[i].id;

        a.textContent = artist_name;
        a.href = `/artist.html?idAutore=${artist_id}`;

        td.appendChild(a);
        tr_artists.appendChild(td);
    }
    overview_table.appendChild(tr_artists);

    td_pubblication_date.textContent = `Data pubblicazione: ${formatDate(album.release_date, album.release_date_precision)}`;
    td_pubblication_date.colSpan = max_col_span;

    tr_pubblication_date.appendChild(td_pubblication_date);
    overview_table.appendChild(tr_pubblication_date);

    td_duration.colSpan = max_col_span;

    tr_duration.appendChild(td_duration);
    overview_table.appendChild(tr_duration);

    th_tracks_name.textContent = "# titolo";
    tr_tracks.appendChild(th_tracks_name);

    th_tracks_duration.textContent = "durata";
    tr_tracks.appendChild(th_tracks_duration);

    tracks_table.appendChild(tr_tracks);

    const songs = album.tracks.items;
    for (let i=0; i<songs.length; i++) {
        const tr = document.createElement("tr"),
              td_song = document.createElement("td"),
              a_song = document.createElement("a"),
              a_autor = document.createElement("a"),
              td_duration = document.createElement("td");

        const s = songs[i];

        const main_artist_id = artists[0].id,
              main_artist_name = artists[0].name,
              song_name = s.name,
              song_duration = s.duration_ms,
              song_uri  = s.uri.slice("spotify:track:".length);

        total_duration += s.duration_ms;

        a_song.href = `/song.html?idCanzone=${song_uri}`;
        a_song.textContent = song_name;
        td_song.appendChild(a_song);

        td_song.appendChild(document.createElement("br"));

        a_autor.href = `/artist.html?idAutore=${main_artist_id}`;
        a_autor.textContent = main_artist_name;
        td_song.appendChild(a_autor);

        for (let i=1; i<artists.length; i++) {
            const artist_id = artists[i].id,
                  artist_name = artists[i].name,
                  a = document.createElement("a");

            a.textContent = artist_name;
            a.href = `/artist.html?idAutore=${artist_id}`;
            td_song.appendChild(a);
        }

        td_duration.textContent = formatMs(song_duration);
        
        tr.appendChild(td_song);
        tr.appendChild(td_duration);

        tracks_table.appendChild(tr);
    }
    td_duration.textContent = `Durata: ${formatAlbumMs(total_duration)}`;

    document.body.appendChild(overview_table);
    document.body.appendChild(tracks_table);
}