let songs;
function sistemaDati(data) {
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
}

document.addEventListener("DOMContentLoaded", async function () {
    const urlSpotify = searchParams.getString("idSpotify"),
          idPlaylist = searchParams.getString("idPlaylist"),
          useSpotify = urlSpotify.length !== 0;

    console.log(useSpotify)
    let data=null;
    if (useSpotify) {
        const idSpotify = urlSpotify.includes("http") ? urlSpotify.slice(urlSpotify.lastIndexOf('/')+1, urlSpotify.indexOf('?')) : urlSpotify;
        data = await api(`spotify/playlist?idPlaylist=${idSpotify}`);
        data=sistemaDati(data);
        renderData(data);
    }
    else {
        data = await api(`getPlaylist?idPlaylist=${idPlaylist}`);
        renderData(data);
    }

    const map_toggle = document.getElementById("map-toggle");

    if (map_toggle !== null) {
        let songs = data.tracks;
        let coordinate=[];
        Promise.all(songs.map(async s => {
            const id_autore=s.artist_uri.slice("spotify:artist:".length),
                  nome_autore=s.artist_name;
            let artisti_str_search = await api(`wikidata/elemento?stringa=${encodeURIComponent(id_autore)}`),
            codiciArtisti = artisti_str_search.map(p => p.title),
            info_artista ={};
            if (codiciArtisti.length === 0) {
                artisti_str_search = await api(`wikidata/elemento?stringa=${encodeURIComponent(nome_autore)}`),
                codiciArtisti = artisti_str_search.map(p => p.title);
                info_artista = (await post_api(
                    'wikidata/artista', 
                    { codiciArtisti,limit:1 }
                ));
                
            }
            else{
                info_artista = await api(`wikidata/artista?idSpotify=${encodeURIComponent(id_autore)}&limit=1`);
            }
            
            let informazioni_wikidata = {};
            if(info_artista.length ===0)
                informazioni_wikidata = null;
            else{
                informazioni_wikidata.artista=info_artista[0].artista.value;
                let coord=info_artista[0].coord.value;
                let info_coord = coord.slice(coord.indexOf('(') + 1, coord.lastIndexOf(')')).split(' ');
                const linkMap=`<a href="/artist.html?idAutore=${id_autore}">${nome_autore}</a>`;
                coordinate.push({lat:info_coord[1],lng:info_coord[0],name:linkMap});
            }

    })).then(()=>{
        
        map_toggle.onmouseup = e => {
            if (e.button === 0) {
                toggle_map_overlay()
                if (map_is_visible && map === null)
                    render_map([41.9028, 12.4964], coordinate,2);
            }
        }
        console.log("finito");
    })
    }
});

function renderData(playlist) {
    let i = 0;
    let title = playlist.name;
    let songs = playlist.tracks;
    Promise.all(songs.map(async e => {
        const artista = e.artist_uri.split(":")[2],
              nomeArtista = FormatArtistName(e.artist_name);

        const ris = await api(`songFeature?track_name=${encodeURIComponent(e.track_name)}`);
        if (ris.status === 400) {
            i++;
        }
        else {
            console.log({ nomeArt: nomeArtista, nomeCanzone: nomeCanzone });
            //const featureCanzone = await ris.json();
        }
         /*urlApi = `http://localhost:3000/api/wikidata/elemento?stringa=${encodeURIComponent(artista)}`,
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
            
        }*/
        
    })).then(_ => {
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