let timeline_overlay, map_overlay,genres_overlay;

function filter_out_blocked_songs(data) {
    data.tracks = data.tracks.filter(s => s.name !== "" && s.artists[0].name !== "" && s.album.name !== "");
    return data;
}

document.addEventListener("DOMContentLoaded", async function () {
    const urlSpotify = searchParams.getString("idSpotify"),
          idPlaylist = searchParams.getString("idPlaylist"),
          useSpotify = urlSpotify.length !== 0;

    let data;
    if (useSpotify) {
        const idSpotify = urlSpotify.includes("http") ? urlSpotify.slice(urlSpotify.lastIndexOf('/')+1, urlSpotify.indexOf('?')) : urlSpotify;
        data = await api(`spotify/playlist?idPlaylist=${idSpotify}`);
        data = filter_out_blocked_songs(data);
        renderData(data);
    }
    else {
        const tdata = await api(`getPlaylist?idPlaylist=${idPlaylist}`),
        song_ids = tdata.tracks.map(t => t.track_uri.slice("spotify:track:".length));
        data = { 
            tracks:await api(`spotify/canzoni?idCanzoni=${song_ids}`),
            name: tdata.name
        };
        data = filter_out_blocked_songs(data);

        renderData(data);
    }

    genres_overlay = new GenresOverlay();
    timeline_overlay = new TimelineOverlay();
    map_overlay = new MapOverlay();

    {
        const songs = data.tracks;
        let coordUnivoche = new Map();
        const all_artists = songs.map(s => s.artists).flat();
        console.log(songs);
        
        let generi=new Map();
        Promise.all(songs.map(async s => {
            const id_artisti=s.artists[0].id,
                 nome_artista=s.artists[0].name,
                 nome_canzone=s.name;
            let artisti_str_search = await api(`wikidata/elemento?stringa=${encodeURIComponent(id_artisti)}`),
            codiciArtisti = artisti_str_search.map(p => p.title);
            if (codiciArtisti.length === 0) {
                artisti_str_search = await api(`wikidata/elemento?stringa=${encodeURIComponent(nome_artista)}`),
                codiciArtisti = artisti_str_search.map(p => p.title);
                if(codiciArtisti.length === 0) {
                    return s;
                }
            }
            const id_canzoni = (await post_api(
                'wikidata/gettest', 
                { codiciArtisti, nomeCanzone:nome_canzone }
            )).map(c => {
                const url = c.canzoni.value;
                return url.slice(url.lastIndexOf('/') + 1,url.length);
            });
    
            if(id_canzoni.length === 0) {
                return s;
            } 
            let dati_canzoni = (await post_api(
                'wikidata/songById',
                { codiciCanzoni:id_canzoni, all:false, limit:100 }
            ))
            //dati_canzoni=dati_canzoni.filter(v=>!/^Q\d+$/.test(v.canzoniLabel.value));
            if(dati_canzoni.length === 0) {
                return s;
            } 
            const dati_genres = new Map(),
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
            }
            for (const [key, value] of dati_genres) {
                if(generi.has(key))
                    generi.set(key, {
                        nome:key,
                        canzoni: [...generi.get(key).canzoni,...value],
                        id: ids.get(key)
                    });
                else generi.set(key, {
                    nome:key,
                    canzoni: value,
                    id: ids.get(key)
                });
            }
        })).then(()=>{
            const dati_genres=[...generi.values()];
            if (dati_genres.length === 0)
                return;
    
            const songs_per_genre = dati_genres.map(v => v.canzoni.length),
                  tot_genres = songs_per_genre.reduce((a,b) => a + b);
            
            genres_overlay.enable_external_toggle(e => {
                if (e.button === 0) {
                    if (genres_overlay.render_object === null)
                        genres_overlay.render("Generi", `informazioni wikidata su ${dati_genres.length} composizioni.`,
                            dati_genres.map(v => {
                                let ogg = { 
                                    y: v.canzoni.length/tot_genres*100, 
                                    genre_name:v.nome,
                                    song_id: "",
                                    song_name: ""
                                };
                                
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
                                
                                return `<p>${this.point.genre_name}: ${formatted_pct}%</p>`;
                            },null);
                    else
                        genres_overlay.toggle_overlay();
                }
            })
        });
        const autoriUnivoci = [...new Map(all_artists.map(a => [a.id, a])).values()];
        console.log(all_artists, [...all_artists])
        Promise.all(autoriUnivoci.map(async s => {
            const id_autore = s.id,
                  nome_autore = s.name;

            let info_artista = await api(`wikidata/artista?idSpotify=${encodeURIComponent(id_autore)}&limit=1`);
            if (info_artista.length === 0) {
                const artisti_str_search = await api(`wikidata/elemento?stringa=${encodeURIComponent(nome_autore)}`),
                      codiciArtisti = artisti_str_search.map(p => p.title);
                info_artista = (await post_api(
                    'wikidata/artista', 
                    { codiciArtisti, limit:1 }
                ));
            }

            if (info_artista.length === 0)
                return;

            const coord = info_artista[0].coord.value,
                    info_coord = coord.slice(coord.indexOf('(') + 1, coord.lastIndexOf(')')).split(' '),
                    linkMap = `<a href="/artist.html?idAutore=${id_autore}">${nome_autore}</a>`;
            let chiave = info_coord.join(",");
            if(coordUnivoche.has(chiave)) {
                const vecchio_valore=coordUnivoche.get(chiave).name;
                coordUnivoche.set(chiave,{lat:info_coord[1],lng:info_coord[0],name:vecchio_valore+"<br>"+linkMap});
            }
            else coordUnivoche.set(chiave,{lat:info_coord[1],lng:info_coord[0],name:linkMap});

        })).then(() => {
            //console.log([ ...coordUnivoche.values()].map(c=>c.name));
            if (coordUnivoche.size === 0)
                return;

            map_overlay.enable_external_toggle(e => {
                if (e.button === 0) {
                    if (map_overlay.render_object === null)
                        map_overlay.render([31.042428797166856, 0], [ ...coordUnivoche.values()], 2);
                    else
                        map_overlay.toggle_overlay();
                }
            })
            console.log("finito");
        })
    }
    
    timeline_overlay.enable_external_toggle(e => {
        if (e.button === 0) {
            if (timeline_overlay.render_object === null)
                timeline_overlay.render(data.name,`playlist da ${data.tracks.length} pezzi musicali.`,
                    data.tracks,
                    (t1,t2) => new Date(t1.album.release_date).getTime() - new Date(t2.album.release_date).getTime(),
                    v => { return { 
                        x: new Date(v.album.release_date),
                        artist_id: v.artists[0].id, // v.artists.map(a => `<a href="/artist.html?idAutore=${a.id}">${a.name}</a>`).join(""), 
                        artist_name: v.artists[0].name, // v.artists.map(a => `<a href="/artist.html?idAutore=${a.id}">${a.name}</a>`).join(""), 
                        track_id: v.id,
                        track_name: v.name,
                        album_id: v.album.id,
                        album_name: v.album.name, 
                        name: v.album.release_date 
                    } },
                    function() {
                        return `<p><a href="/song.html?idCanzone=${this.point.track_id}">${this.point.track_name}</a></p><br>
                                <p><a href="/artist.html?idAutore=${this.point.artist_id}">${this.point.artist_name}</a></p><br>
                                <p><a href="/album.html?idAlbum=${this.point.album_id}">${this.point.album_name}</a></p><br>`;
                    });
            else
                timeline_overlay.toggle_overlay();
        }
    })

});

function renderData(playlist) {
    console.log(playlist);
    let i = 0;
    let title = playlist.name;
    let songs = playlist.tracks;

    document.title = title;

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
              td_album = document.createElement("td"),
              a_album = document.createElement("a"),
              td_duration = document.createElement("td");

        const s = songs[i];

        const albumId = s.album.id,
              song = s.name,
              songUri = s.id,
              album = s.album.name;

        a_song.href = `/song.html?idCanzone=${songUri}`;
        a_song.textContent = song;
        td_song.appendChild(a_song);

        td_song.appendChild(document.createElement("br"));

        for (let i=0; i<s.artists.length; i++) {
            const a_autor = document.createElement("a"),
                  artist = s.artists[i].name,
                  artistId = s.artists[i].id;
            a_autor.href = `/artist.html?idAutore=${artistId}`;
            a_autor.textContent = artist;
            td_song.appendChild(a_autor);
        }

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