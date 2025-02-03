const fs = require('fs');
//import fs from 'fs';
const pathSongs="music_dataset.csv";
const pathPlaylistsList = "./data";
function getSongs() {
    const file=fs.readFileSync(pathSongs);

    const songs=file.toString().split('\n').map(line => line.split(',').slice(1));
    const etichette=songs[0];
    const ris= songs.slice(1).map(song=>{
        const obj = {};
        etichette.forEach((label, index) => {
            obj[label] = song[index];  // Aggiunge la coppia chiave-valore all'oggetto
        });
        return obj;  
    });
    return ris;  // Restituisce un array di oggetti, dove ogni oggetto rappresenta una canzone
}

function getPlaylists(file) {
    return JSON.parse(fs.readFileSync(file)).playlists;
}
function getListPlaylists(numFile) {
    let files=fs.readdirSync(pathPlaylistsList);
    files =files.sort((a, b) => {
        // Estrarre il primo numero dal nome del file
        const numA = parseInt(a.match(/\d+/)[0], 10);
        const numB = parseInt(b.match(/\d+/)[0], 10);
        return numA - numB;
    });
    let result=[];
    if(numFile==undefined) {
        numFile=files.length;  // Se non specificato, considera tutte le playlist
    }
    for (let i=0;i<numFile;i++) {
        result.push(...getPlaylists(pathPlaylistsList+"/"+files[i]));
    }
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
module.exports = { getSongs, getListPlaylists };