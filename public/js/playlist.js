let songs;
/*function sistemaDati(data) {
    console.log(data);
    const ris = { 
        name: data.name,
        tracks: data.tracks.map(item => {
            const ris = {
                artist_uri: `spotify:artist:${item.artists[0].id}`,
                artist_name: item.artists[0].name,
                track_name: item.name,
                album_uri: `spotify:album:${item.album.id}`,
                album_name: item.album.name,
                duration_ms: item.duration_ms,
                track_uri: `spotify:track:${item.id}`
            };
            
            return ris;
        })

    };

    return ris;
}*/

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
       // data = sistemaDati(data);
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

    if (map_icon !== null) {
        const songs = data.tracks;
        let coordUnivoche = new Map();
        const autoriUnivoci = [...new Map(songs.map(s=>[s.artists[0].id,s.artists[0]])).values()];
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
            
            let informazioni_wikidata = {};
            if (info_artista.length === 0)
                informazioni_wikidata = null;
            else {
                informazioni_wikidata.artista = info_artista[0].artista.value;
                const coord = info_artista[0].coord.value,
                      info_coord = coord.slice(coord.indexOf('(') + 1, coord.lastIndexOf(')')).split(' '),
                      linkMap = `<a href="/artist.html?idAutore=${id_autore}">${nome_autore}</a>`;
                let chiave=info_coord.join(",");
                if(coordUnivoche.has(chiave)){
                    const vecchio_valore=coordUnivoche.get(chiave).name;
                    coordUnivoche.set(chiave,{lat:info_coord[1],lng:info_coord[0],name:vecchio_valore+"<br>"+linkMap});
                }else
                    coordUnivoche.set(chiave,{lat:info_coord[1],lng:info_coord[0],name:linkMap});
            }
        })).then(() => {
            //console.log([ ...coordUnivoche.values()].map(c=>c.name));
            if (coordUnivoche.size !== 0)
                enable_map_icon();

            map_icon.onmouseup = e => {
                if (e.button === 0) {
                    if (map === null)
                        render_map([31.042428797166856, 0], [ ...coordUnivoche.values()], 2);
                    else
                        toggle_map_overlay();
                }
            }
            console.log("finito");
        })
    }

    if (timeline_icon !== null) {
        if (data.tracks.length > 0)
            enable_timeline_icon();

        timeline_icon.onmouseup = e => {
            if (e.button === 0) {
                if (timeline === null)
                    render_timeline(data.name,`playlist da ${data.tracks.length} pezzi musicali.`,
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
                    toggle_timeline_overlay();
            }
        }
    }

});

function renderData(playlist) {
    console.log(playlist);
    let i = 0;
    let title = playlist.name;
    let songs = playlist.tracks;

    document.title = title;
    // Promise.all(songs.map(async e => {
    //     const artista = e.artist_uri.split(":")[2],
    //           nomeArtista = FormatArtistName(e.artist_name);

    //     const ris = await api(`songFeature?track_name=${encodeURIComponent(e.track_name)}`);
    //     if (ris.status === 400) {
    //         i++;
    //     }
    //     else {
    //         console.log({ nomeArt: nomeArtista, nomeCanzone: nomeCanzone });
    //         //const featureCanzone = await ris.json();
    //     }
    //      /*urlApi = `http://localhost:3000/api/wikidata/elemento?stringa=${encodeURIComponent(artista)}`,
    //           ris = await fetch(urlApi);

    //     let artisti = (await ris.json()).map(p => p.title);
    //     if (artisti.length === 0) {
    //         urlApi = `http://localhost:3000/api/wikidata/elemento?stringa=${encodeURIComponent(nomeArtista)}`;
    //         ris = await fetch(urlApi);
    //         artisti = (await ris.json()).map(p => p.title);
    //     }
        

    //     urlApi = `http://localhost:3000/api/wikidata/gettest`;
    //     ris = await fetch(urlApi, { 
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify({ codiciArtisti: artisti,nomeCanzone:nomeCanzone }) 
    //     });
        
    //     const canzoniTrovate = await ris.json();
    //     if (canzoniTrovate.length === 0) {
    //         console.log({ nomeArt: nomeArtista, nomeCanzone: nomeCanzone, art: artisti, info:canzoniTrovate });
    //         i++;
            
    //     }*/
        
    // })).then(_ => {
    //     console.log(`${i} su ${songs.length} elementi non trovati`);
    // });
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

        const artistId = s.artists[0].id,
              albumId = s.album.id,
              song = s.name,
              songUri = s.id,
              album = s.album.name,
              artist = s.artists[0].name;

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