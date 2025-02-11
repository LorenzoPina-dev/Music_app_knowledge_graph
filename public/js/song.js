async function GetData(id) {
    const canzone_spotify = await api(`spotify/canzone?id=${id}`),
          idAutore = canzone_spotify.artists.map(a => a.id),
          nomeAutore = canzone_spotify.artists.map(a => FormatArtistName(a.name)),
          nomeCanzone = FormatSongName(canzone_spotify.name);

    const featureCanzone = await api(`songFeature?track_name=${encodeURIComponent(canzone_spotify.name)}`);
    console.log(featureCanzone);

    const dati = canzone_spotify;

    let artisti_str_search = await api(`wikidata/elemento?stringa=${encodeURIComponent(idAutore[0])}`),
        codiciArtisti = artisti_str_search.map(p => p.title);
    if (codiciArtisti.length === 0) {
        artisti_str_search = await api(`wikidata/elemento?stringa=${encodeURIComponent(nomeAutore[0])}`),
        codiciArtisti = artisti_str_search.map(p => p.title);
    }

    const id_canzoni = (await post_api(
        'wikidata/gettest', 
        { codiciArtisti, nomeCanzone }
    )).map(c => {
        const url = c.canzoni.value;
        return url.slice(url.lastIndexOf('/') + 1);
    });

    const dati_canzoni = (await post_api(
        'wikidata/songById',
        { codiciCanzoni:id_canzoni }
    )).filter(c => {
        let url = c.artista.value;
        url = url.slice(url.lastIndexOf('/') + 1);
        return codiciArtisti.includes(url);
    });

    if (dati_canzoni.length > 0) {
        dati.wikidata_release_date = dati_canzoni.sort((a, b) => new Date(a.pubblicazione.value) - new Date(b.pubblicazione.value))[0].pubblicazione.value;
        dati.wikidata_genres = [...new Set(dati_canzoni.map(c => c.genereLabel.value))];
    }

    return dati;
}

document.addEventListener("DOMContentLoaded", async function () {
    const idCanzone = searchParams.getString("idCanzone"),
          data = await GetData(idCanzone);

    renderData(data);
});

function renderData(data) {
    const song_name = data.name,
          artists = data.artists,
          album_name = data.album.name,
          album_id = data.album.id,
          duration = data.duration_ms,
          release_date = data.album.release_date,
          release_date_precision = data.album.release_date_precision;

    console.log(release_date, release_date_precision)

    const img = document.createElement("img");
    img.src = data.album.images[1].url;
    document.body.prepend(img);

    const table = document.createElement("table"),
          first_tr = document.createElement("tr"),
          th = document.createElement("th"),
          tr_artists = document.createElement("tr"),
          td_artists = document.createElement("td"),
          tr_album = document.createElement("tr"),
          td_album = document.createElement("td"),
          a_album = document.createElement("a"),
          tr_duration = document.createElement("tr"),
          td_duration = document.createElement("td"),
          tr_release_data = document.createElement("tr"),
          td_release_date = document.createElement("td");

    th.textContent = `Canzone: ${song_name}`;
    first_tr.appendChild(th);

    table.appendChild(first_tr);

    tr_artists.classList.add("artists");

    for (let i=0; i<artists.length; i++) {
        const a = document.createElement("a");
        a.textContent = artists[i].name;
        a.href = `/artist.html?idAutore=${artists[i].id}`;
        td_artists.appendChild(a);
    }

    tr_artists.appendChild(td_artists);
    table.appendChild(tr_artists);

    a_album.textContent = album_name;
    a_album.href = `/album.html?idAlbum=${album_id}`;

    td_album.appendChild(a_album);
    tr_album.appendChild(td_album);
    table.appendChild(tr_album);

    td_duration.textContent = `durata: ${formatMs(duration)}`;

    tr_duration.appendChild(td_duration);
    table.appendChild(tr_duration);

    td_release_date.textContent = `data di pubblicazione: ${formatDate(release_date, release_date_precision)}`;

    tr_release_data.appendChild(td_release_date);
    table.appendChild(tr_release_data);

    const genres = data.wikidata_genres;
    if (genres !== undefined) {
        const tr_genres = document.createElement("tr"),
              td = document.createElement("td");
        tr_genres.classList.add("genres");
        for (let i=0; i<genres.length; i++) {
            const a = document.createElement("a");
            a.textContent = genres[i];
            td.appendChild(a);
        }
        tr_genres.appendChild(td);
        table.appendChild(tr_genres);
    }

    document.body.appendChild(table);
}