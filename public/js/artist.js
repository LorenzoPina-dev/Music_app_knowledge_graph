let timeline_overlay, map_overlay, genres_overlay;

document.addEventListener("DOMContentLoaded", async function () {
    const idAutore = searchParams.getString("idAutore"),
          offset = searchParams.getNumber("offset");

    const autore = await api(`spotify/autore/?idAutore=${idAutore}`),
          album = await api(`spotify/albumAutore/?idAutore=${idAutore}&offset=${offset}`);

    let artisti_str_search = await api(`wikidata/elemento?stringa=${encodeURIComponent(idAutore)}`),
        codiciArtisti = artisti_str_search.map(p => p.title),
        info_artista = {};

    if (codiciArtisti.length === 0) {
        artisti_str_search = await api(`wikidata/elemento?stringa=${encodeURIComponent(autore.body.name)}`),
        codiciArtisti = artisti_str_search.map(p => p.title);
        info_artista = (await post_api(
            'wikidata/artista', 
            { codiciArtisti }
        ));
    }
    else info_artista = await api(`wikidata/artista?idSpotify=${encodeURIComponent(idAutore)}`);

    genres_overlay = new GenresOverlay(),
    timeline_overlay = new TimelineOverlay();
    map_overlay = new MapOverlay();

    let wikidata = {};
    if (info_artista.length === 0)
        wikidata = null;
    else {
        const coord = info_artista.filter(a => a.artista !== undefined)[0]?.coord.value,
              info_coord = coord.slice(coord.indexOf('(') + 1, coord.lastIndexOf(')')).split(' ');
              Promise.all( [
                ...new Map(
                    info_artista
                        .filter(i => i.premiLabel !== undefined)
                        .map(i =>[i.premiLabel.value ,{id:i.premi.value.slice(i.premi.value.lastIndexOf('/')+1,i.premi.value.length),nome:i.premiLabel.value}])
                    ).values()
                ].map(async i=>{
                    let {id,nome}=i;
                    let altroArtista=(await post_api(`wikidata/suggerimentoArtista`,{codiciArtisti,codicePremio:id}));
                    if(altroArtista.length===0)
                        return {id,nome };
                    let idAltroArtista=altroArtista[0].artista.value.slice(altroArtista[0].artista.value.lastIndexOf('/')+1,altroArtista[0].artista.value.length);
                    return {id,nome,artista:{id:idAltroArtista,nome:altroArtista[0].artistaLabel.value,codice:altroArtista[0].codice.value}};
                })).then(data=>{
                    wikidata = {
                    artista: info_artista.filter(a => a.artista !== undefined)[0]?.artista.value,
                    coord: { lat:info_coord[1], lng:info_coord[0] },
                    origin: info_artista.filter(a => a.originLabel !== undefined)[0]?.originLabel.value,
                    startWork: info_artista.filter(a => a.startWork !== undefined)[0]?.startWork.value,
                    premi:  data
                };
                renderData(wikidata, autore.body, album.body, idAutore);
    
        
    });
    
    new Promise(async(resolve, reject) => {
        let artisti_str_search = await api(`wikidata/elemento?stringa=${encodeURIComponent(autore.body.id)}`),
        codiciArtisti = artisti_str_search.map(p => p.title);
        if (codiciArtisti.length === 0) {
            artisti_str_search = await api(`wikidata/elemento?stringa=${encodeURIComponent(autore.body.name)}`),
            codiciArtisti = artisti_str_search.map(p => p.title);
            if(codiciArtisti.length === 0) {
                reject("artista non trovato");
                return;
            }
        }

        const id_canzoni = (await post_api(
            'wikidata/gettest', 
            { codiciArtisti }
        )).map(c => {
            const url = c.canzoni.value;
            return url.slice(url.lastIndexOf('/') + 1,url.length);
        });

        if(id_canzoni.length === 0) {
            reject("artista non ha canzoni");
            return;
        } 
        let dati_canzoni = (await post_api(
            'wikidata/songById',
            { codiciCanzoni:id_canzoni, all:false, limit:100 }
        ))
        //dati_canzoni=dati_canzoni.filter(v=>!/^Q\d+$/.test(v.canzoniLabel.value));
        if(dati_canzoni.length === 0) {
            reject("canzone non trovata");
            return;
        } 
        const dati_timeline = new Map(),
              dati_genres = new Map(),
              ids = new Map();

        for(let i=0; i<dati_canzoni.length; i++){
            const item = dati_canzoni[i],
                  chiave = item.genereLabel.value;
                  
            ids.set(chiave,item.genere.value.slice(item.genere.value.lastIndexOf('/')+1,item.genere.value.length));
            if (dati_genres.has(chiave)) { 
                if (!dati_genres.get(chiave).includes(item.canzoniLabel.value))
                    dati_genres.set(chiave, [
                        ...dati_genres.get(chiave), 
                        item.canzoniLabel.value
                    ]);
            }
            else dati_genres.set(chiave,[item.canzoniLabel.value]);

            const chiave2 = item.canzoniLabel.value;
            if (dati_timeline.has(chiave2))
                dati_timeline.set(chiave2, {
                    nome: chiave2,
                    pubblicazione: dati_timeline.get(chiave2).pubblicazione
                });
            else {
                let time = new Date(item.pubblicazione.value).getTime();
                dati_timeline.set(chiave, {
                    nome:item.canzoniLabel.value,
                    pubblicazione:time
                });
            }
        }
        const result = [];
        for (const [key, value] of dati_genres) {
            result.push({
                nome:key,
                canzoni: value,
                suggerimento: await post_api(`wikidata/suggerimentoCanzone`,{codiceGenere:ids.get(key),codiciArtisti:codiciArtisti}),
                id: ids.get(key)
            });
        }

        resolve({
            dati_timeline:[...dati_timeline.values()],
            dati_genres:result
        });
    }).then(data => {
        if (data.dati_timeline.length !== 0) {
            timeline_overlay.enable_external_toggle(e => {
                if (e.button === 0) {
                    if (timeline_overlay.render_object === null)
                        timeline_overlay.render("Pubblicazioni",`informazioni su ${data.dati_timeline.length} pubblicazioni.`,
                            data.dati_timeline,
                            (a,b) => a.pubblicazione - b.pubblicazione,
                            v => { return { x: v.pubblicazione, name:v.nome, description:`successo nel ${formatDate(v.pubblicazione)}.` } },
                            undefined,
                            false)

                    else
                        timeline_overlay.toggle_overlay();
                }
            })
        }

        /*{
                    nome: nome genere,
                    canzoni: lista nomi canzoni con quel genere,
                    id: codice wikidata genere
                }
        */

        if (data.dati_genres.length === 0)
            return;

        const songs_per_genre = data.dati_genres.map(v => v.canzoni.length),
              tot_genres = songs_per_genre.reduce((a,b) => a + b);
        
        genres_overlay.enable_external_toggle(e => {
            if (e.button === 0) {
                if (genres_overlay.render_object === null)
                    genres_overlay.render("Generi", `informazioni wikidata su ${data.dati_genres.length} composizioni.`,
                        data.dati_genres.map(v => {
                            let ogg = { 
                                y: v.canzoni.length/tot_genres*100, 
                                genre_name:v.nome,
                                song_id: "",
                                song_name: ""
                            };
                            if(v.suggerimento.length > 0) {
                                ogg.song_id=`/song.html?idCanzone=${v.suggerimento[0]?.codice.value}`;
                                ogg.song_name = v.suggerimento[0]?.canzoniLabel.value;
                            }  
                            return ogg
                        }),
                        // data label formatter
                        function() {
                            return `<p>${this.point.genre_name}</p>`;
                        },
                        // tooltip formatter
                        function() {
                            const pct = this.point.y,
                                  is_int = pct % 1 === 0,
                                  formatted_pct = is_int ? `${pct}` : pct.toFixed(1);
                            if (this.point.song_id !== "" && this.point.song_name !== "")
                                return `<p>${this.point.genre_name}: ${formatted_pct}%</p><br><a href="">${this.point.song_name}</a>`
                            else
                                return `<p>${this.point.genre_name}: ${formatted_pct}%</p>`;
                        },
                        // slice on click
                        function(e) {
                            if (e.button !== 0)
                                return;

                            if (this.point.song_id !== "") {
                                e.ctrlKey ? window.open(this.point.song_id) : window.location.assign(this.point.song_id);
                            }
                        });
                else
                    genres_overlay.toggle_overlay();
            }
        })
        console.log("finito timeline");
    });
}});

function renderData(wikidata, autore, album, idAutore) {
    const container = document.createElement("div");
    container.id = "container";

    const name = autore.name,
          followers = autore.followers.total,
          album_count = album.total,
          genres = autore.genres,
          genre_count = genres.length,
          max_col_span = genre_count || 1;

    document.title = name;

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

    if (max_col_span > 1) {
        document.documentElement.style.setProperty('--genre-count', max_col_span.toString());
        th_name.colSpan = max_col_span;
        td_followers.colSpan = max_col_span;
        td_album_count.colSpan = max_col_span;
    }

    if (genre_count > 0) {
        const tr = document.createElement("tr"),
              td = document.createElement("td");
        tr.classList.add("lista");

        for (let i=0; i<genre_count; i++) {
            const a = document.createElement("a");
            a.textContent = genres[i];
            td.appendChild(a);
        }
        tr.appendChild(td);
        overview_table.appendChild(tr);
    }

    if (wikidata !== null) {
        if (wikidata.origin !== undefined && wikidata.coord !== undefined) {
            const lat = Number(wikidata.coord.lat),
                  lng = Number(wikidata.coord.lng);

            map_overlay.enable_external_toggle(e => {
                if (e.button === 0) {
                    if (map_overlay.render_object === null)
                        map_overlay.render([lat, lng], [{lat, lng, name:wikidata.origin}], 11);
                else
                    map_overlay.toggle_overlay();
                }
            });

            if (wikidata.startWork !== undefined) {
                const tr = document.createElement("tr"),
                      td = document.createElement("td");
                td.innerText = `Inizio carriera: ${formatDate(wikidata.startWork)}`;
                tr.appendChild(td);
                overview_table.appendChild(tr);
            }

            const premi_count = wikidata.premi?.length;
            if (wikidata.premi !== undefined && premi_count > 0) {
                const tr = document.createElement("tr"),
                      td = document.createElement("td");
                tr.classList.add("lista");

                for (let i=0; i<premi_count; i++) {
                    const a = document.createElement("a");
                    a.textContent = wikidata.premi[i].nome;
                    if (wikidata.premi[i].artista !== undefined)
                        a.href = `/artist.html?idAutore=${wikidata.premi[i].artista.codice}` 
                    td.appendChild(a);
                }
                tr.appendChild(td);
                overview_table.appendChild(tr);
            }
        }
    }

    td_album_count.textContent = `Numero di risultati: ${album_count}`;
    tr_album_count.appendChild(td_album_count);
    overview_table.appendChild(tr_album_count);

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

        div.onmouseup = e => e.button === 0 ? window.location.assign(`/album.html?idAlbum=${al.id}`) : void 0;

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

        const back = e => e.button === 0 ? window.location.assign(`/artist.html?idAutore=${idAutore}&offset=${left_limit}`) : void 0,
              forward = e => e.button === 0 ? window.location.assign(`/artist.html?idAutore=${idAutore}&offset=${right_limit}`) : void 0;

        if (offset !== 0)
            left_button.onmouseup = back;
        else
            left_button.classList.add("blocked");

        if (right_limit < album_count)
            right_button.onmouseup = forward;
        else
            right_button.classList.add("blocked");

        left_button.appendChild(left_a);
        right_button.appendChild(right_a);

        navigate.appendChild(left_button);
        navigate.appendChild(right_button);

        const navigate_clone = navigate.cloneNode(true);

        navigate_clone.firstChild.onmouseup = left_button.onmouseup;  
        navigate_clone.lastChild.onmouseup = right_button.onmouseup;

        document.body.appendChild(navigate);
        document.body.appendChild(container);
        document.body.appendChild(navigate_clone);
    }
    else {
        document.body.appendChild(container);
    }
}