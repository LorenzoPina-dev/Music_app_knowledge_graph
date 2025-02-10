async function GetData(id){
    let datiCanzone={};
    let urlApi = `http://localhost:3000/api/spotify/canzone?id=${id}`;
    console.log(urlApi);
    let ris = await fetch(urlApi);
    ris=await ris.json();
    console.log(ris);
    let idAutore=ris.artists.map(a=>a.id);
    let nomeAutore =ris.artists.map(a=>FormatArtistName( a.name)) ;
    let nomeCanzone = FormatSongName( ris.name);
    datiCanzone["artist"]=ris.artists.map(a=>{return {id: a.id, name: a.name}});
    datiCanzone["nomeCanzone"]=ris.name;
    datiCanzone["album"]={id: ris.album.id,name:ris.album.name};
    datiCanzone["durata"]=ris.duration_ms;
    datiCanzone["available_markets"]=ris.available_markets;

    urlApi = `http://localhost:3000/api/wikidata/elemento?stringa=${encodeURIComponent(idAutore[0])}`,
    ris = await fetch(urlApi);
    let artisti = (await ris.json()).map(p => p.title);
    if (artisti.length === 0) {
    urlApi = `http://localhost:3000/api/wikidata/elemento?stringa=${encodeURIComponent(nomeAutore[0])}`;
    ris = await fetch(urlApi);
    artisti = (await ris.json()).map(p => p.title);
    }
    console.log(artisti);
    console.log(nomeCanzone);
    urlApi = `http://localhost:3000/api/wikidata/gettest`;
    ris = await fetch(urlApi, { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codiciArtisti: artisti,nomeCanzone:nomeCanzone }) 
    });

    ris=await ris.json();
    const codiciCanzoni= ris.map(c=>{
        let url=c.canzoni.value;
        return url.slice(url.lastIndexOf('/')+1);
    });
    console.log(codiciCanzoni);
    
    urlApi = `http://localhost:3000/api/wikidata/songById`;
    ris = await fetch(urlApi, { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codiciCanzoni: codiciCanzoni }) 
    });

    ris=await ris.json();
    ris=ris.filter(c=>{
        let url=c.artista.value;
        url=url.slice(url.lastIndexOf('/')+1);
        return artisti.includes(url);
    });

    if(ris.length > 0){
        datiCanzone["pubblicazione"]=ris.sort((a, b) => new Date(a.pubblicazione.value) - new Date(b.pubblicazione.value))[0].pubblicazione.value;
        datiCanzone["generi"]=[...new Set(ris.map(c=>c.genereLabel.value))];
    }

    return datiCanzone;
}


let codA;
let nomCanzone;

document.addEventListener("DOMContentLoaded", function () {
    let url=new URL(window.location.href);
    const idCanzone = url.searchParams.get('idCanzone');

    GetData(idCanzone)
        .then(data => renderData(data)) // Handle the data
        .catch(error => console.error('Error:', error)); // Handle errors
});

function renderData(data){

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
    if(data.length == 0){
        document.getElementById("nomeCanzone").innerHTML = "Canzone non trovata";
        return;
    }
    const timeline=document.createElement('table');
    data.forEach(el=>{
        let tr=document.createElement('tr');
        let td=document.createElement('td');
        td.style.border="1px solid";
        td.innerHTML=el.artistaLabel.value;
        tr.appendChild(td);
         td=document.createElement('td');
         td.style.border="1px solid";
        td.innerHTML=el.canzoniLabel.value;
        tr.appendChild(td);
         td=document.createElement('td');
         td.style.border="1px solid";
        td.innerHTML=el.genereLabel.value;
        tr.appendChild(td);
        timeline.appendChild(tr);
    });
    timeline.style.borderCollapse="collapse";
    timeline.style.width="100%";
    document.getElementById("timeLine").appendChild(timeline);
    


    document.getElementById("nomeCanzone").innerHTML = data[0].nomeCanzone.value;
    let aAutor=document.getElementById("aArtista");
    let aAlbum=document.getElementById("aAlbum");
    let dataPubb=document.getElementById("dataPubblicazione");
    dataPubb.innerHTML=data[0].pubblicazione.value;
    aAutor.href=`/artist.html?idAutore=${codA}`;
    aAlbum.href=`/album.html?idAutore=${codA}&idAlbum=${data[0].nomeAlbum.value}`;
    aAutor.innerHTML=data[0].artistaNome.value;
    aAlbum.innerHTML=data[0].nomeAlbum.value;
    let divGeneri=document.getElementById('divgeneri');
    divGeneri.innerHTML=''; // Clean previous content
    data.forEach(e => {
        console.log(e);
        let h3=document.createElement('h3');
        h3.innerHTML=e.nomeGenere.value;
        divGeneri.appendChild(h3);
    });
}