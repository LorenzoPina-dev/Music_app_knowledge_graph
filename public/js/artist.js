document.addEventListener("DOMContentLoaded", async function () {
    let url = new URL(window.location.href);

    const idAutore = url.searchParams.get('idAutore'),
          offset = url.searchParams.get('offset');

    
    try {
        /**
         * {
         *  followers: { total },
         *  genres?: []
         *  name,
         *  // popularity
         * }
         */
        const autore = await (await fetch(`http://localhost:3000/api/spotify/autore/?idAutore=${idAutore}`)).json(),
        /**
         * items: [{name, uri, total_tracks}]
         * total
         */
              album = await (await fetch(`http://localhost:3000/api/spotify/albumAutore/?idAutore=${idAutore}&offset=${offset}`)).json();
              //dati_personali = await (await fetch(`http://localhost:3000/api/wikidata/`)).json();

        renderData(autore.body, album.body, idAutore);
    }
    catch (err) {
        console.error(err)
    }
});

// Nome 	Pippo
// Followers 331
// Anno di nascita 	1960
// Luogo di nascita 	Roma
// Numero di album 	100

// Genere musical 	Pop

// track 	

function renderData(autore, album, idAutore) {
    console.log(album)

    const container = document.getElementById("container");

    const name = autore.name,
          followers = autore.followers.total,
          album_count = album.total,
          genres = autore.genres,
          genre_count = genres.length,
          max_col_span = genre_count || 1;

    const overview_table = document.createElement("table"),
          tr_name = document.createElement("tr"),
          th_name = document.createElement("th"),
          tr_followers = document.createElement("tr"),
          td_followers = document.createElement("td"),
          tr_album_count = document.createElement("tr"),
          td_album_count = document.createElement("td");

    overview_table.classList.add("overview");

    th_name.textContent = `Artista: ${name}`;
    tr_name.appendChild(th_name);
    overview_table.appendChild(tr_name);

    td_followers.textContent = `${formatFollowers(followers)} followers`;
    tr_followers.appendChild(td_followers);
    overview_table.appendChild(tr_followers);

    // if (anno_nascita !== undefined)
    // 
    // if (luogo_nascita !== undefined)

    td_album_count.textContent = `Numero di album: ${album_count}`;
    tr_album_count.appendChild(td_album_count);
    overview_table.appendChild(tr_album_count);

    if (max_col_span > 1) {
        document.documentElement.style.setProperty('--genre-count', max_col_span.toString());
        th_name.colSpan = max_col_span;
        td_followers.colSpan = max_col_span;
        td_album_count.colSpan = max_col_span;
    }

    if (genre_count > 0) {
        const tr = document.createElement("tr"),
              td = document.createElement("td");
        tr.classList.add("genres");

        for (let i=0; i<genre_count; i++) {
            const a = document.createElement("a");
            a.textContent = genres[i];
            td.appendChild(a);
        }
        tr.appendChild(td);
        overview_table.appendChild(tr);
    }

    document.body.prepend(overview_table);

    const author_img = document.createElement("img");
    author_img.src = autore.images[1].url;
    author_img.alt = name;
    document.body.prepend(author_img);

    for (let i=0; i<album.items.length; i++) {
        const div = document.createElement("div"),
              img = document.createElement("img"),
              a = document.createElement("a");

        const al = album.items[i];

        a.textContent = al.name;

        img.src = al.images[1].url; // 300x300
        div.appendChild(img);
        div.appendChild(a);

        div.onmouseup = e => e.button === 0 ? window.location.assign(`/album.html?idAlbum=${al.uri.slice("spotify:album:".length)}`) : void 0;

        container.appendChild(div);
    }


    
    const limit = album.limit,
          offset = album.offset;

    if (album_count > limit) {

        const navigate = document.createElement("div"),
            left_button = document.createElement("div"),
            left_a = document.createElement("a"),
            right_button = document.createElement("div"),
            right_a = document.createElement("a");

        navigate.classList.add("navigate");

        const left_limit = offset - limit < 0 ? 0 : offset - limit,
            right_limit = offset + limit;

        left_a.textContent = "<";
        right_a.textContent = ">";

        if (offset !== 0)
            left_button.onmouseup = e => e.button === 0 ? window.location.assign(`/artist.html?idAutore=${idAutore}&offset=${left_limit}`) : void 0;
        else
            left_button.classList.add("blocked");

        if (right_limit < album_count)
            right_button.onmouseup = e => e.button === 0 ? window.location.assign(`/artist.html?idAutore=${idAutore}&offset=${right_limit}`) : void 0;
        else
            right_button.classList.add("blocked");

        left_button.appendChild(left_a);
        right_button.appendChild(right_a);

        navigate.appendChild(left_button);
        navigate.appendChild(right_button);

        document.body.appendChild(navigate);
    }
}