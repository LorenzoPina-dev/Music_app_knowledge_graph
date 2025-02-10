const fs = require('fs'),
      cvs_path = "music_dataset.csv",
      playlist_path = "./data";

function getSongs() {
    const file = fs.readFileSync(cvs_path, {encoding:"utf8"});
          [etichette, ...songs] = file.split('\n').map(line => line.split(',').slice(1));

    const ris = songs.map(song => {
        const s = {};

        for (let i=0; i<etichette.length; i++) {
            const label = etichette[i], value = song[i];
            s[label] = value;
        }
        
        return s;  
    });
    return ris;  // Restituisce un array di oggetti, dove ogni oggetto rappresenta una canzone
}

function getPlaylists(file) {
    return JSON.parse(fs.readFileSync(file)).playlists;
}
function getListPlaylists(numFile) {
    const prefix_length = "mpd.slice.".length,
          suffix_length = ".json".length;

    const files = fs.readdirSync(playlist_path).sort((a, b) => {
        // Estrarre il primo numero dal nome del file
        const numA = Number(a.slice(prefix_length,-suffix_length).split("-")[0]),
              numB = Number(b.slice(prefix_length,-suffix_length).split("-")[0]);
        return numA - numB;
    });

    const result = [];
    if (numFile === undefined)
        numFile = files.length;  // Se non specificato, considera tutte le playlist

    for (let i=0; i<numFile; i++)
        result.push(...getPlaylists(playlist_path + "/" + files[i]));

    return result;
}


function getPlaylistDyId(idPlaylist) {
    const prefix_length = "mpd.slice.".length,
          suffix_length = ".json".length;
    idPlaylist = Number(idPlaylist);
    const files = fs.readdirSync(playlist_path).filter(a => {
        // Estrarre il primo numero dal nome del file
        const bounds=a.slice(prefix_length,-suffix_length).split("-");
        return Number(bounds[0])<=idPlaylist&&idPlaylist<=Number(bounds[1]);
    });

    const result = [];

    for (let i=0; i<files.length; i++)
        result.push(...getPlaylists(playlist_path + "/" + files[i]));

    return result;
}
/*
let ris=getListPlaylists(5)
for(const playlists of ris) {
    playlists.map((d)=>{
        d.map((r)=>console.log(r));
    });
}
*/
//export default getListPlaylists;
module.exports = { getSongs, getListPlaylists,getPlaylistDyId };