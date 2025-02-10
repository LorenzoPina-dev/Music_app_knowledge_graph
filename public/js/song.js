async function GetData(id) {
    const canzone_spotify = await api(`spotify/canzone?id=${id}`);

    let idAutore = canzone_spotify.artists.map(a => a.id),
        nomeAutore = canzone_spotify.artists.map(a => FormatArtistName(a.name)),
        nomeCanzone = FormatSongName(canzone_spotify.name);


    const dati = canzone_spotify;
    // const dati = {
    //     artist: canzone_spotify.artists.map(a => {return {id:a.id, name:a.name}}),
    //     nomeCanzone: canzone_spotify.name,
    //     album: {
    //         id:canzone_spotify.album.id, 
    //         name:canzone_spotify.album.name
    //     },
    //     durata: canzone_spotify.duration_ms,
    //     available_markets: canzone_spotify.available_markets
    // }

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


let codA;
let nomCanzone;

document.addEventListener("DOMContentLoaded", async function () {
    const url = new URL(window.location.href),
          idCanzone = url.searchParams.get('idCanzone');

    GetData(idCanzone)
        .then(data => renderData(data))
});

function renderData(data) {

    /*
    data={
        album:{id: '5x8e8UcCeOgrOzSnDGuPye', name: 'PCD'}
        artist:[{id: "6wPhSqRtPu1UhRCDX5yaDJ",name: "The Pussycat Dolls"}]
        available_markets:['CA', 'MX', 'US']
        durata:225560
        generi:['contemporary R&B', 'pop music']
        nomeCanzone:"Buttons"
        pubblicazione:"2005-09-12T00:00:00Z"
    }
    */
   // const d=data.map(dat=>dat.nomeCanzone.value);
    console.log(data);
    
    //const timeline = document.createElement('table');
    // data.forEach(el => {
    //     const tr = document.createElement('tr');
    //     let td = document.createElement('td');

    //     td.innerHTML = el.artistaLabel.value;
    //     tr.appendChild(td);
    //     td = document.createElement('td');

    //     td.innerHTML = el.canzoniLabel.value;
    //     tr.appendChild(td);

    //     td = document.createElement('td');
    //     td.innerHTML = el.genereLabel.value;
    //     tr.appendChild(td);
    //     timeline.appendChild(tr);
    // });

   // document.getElementById("timeLine").appendChild(timeline);

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