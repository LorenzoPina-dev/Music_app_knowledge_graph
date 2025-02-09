async function GetData(idAutore,nomeAutore,nomeCanzone){
    
    let urlApi = `http://localhost:3000/api/wikidata/elemento?stringa=${encodeURIComponent(idAutore)}`,
    ris = await fetch(urlApi);

    let artisti = (await ris.json()).map(p => p.title);
    if (artisti.length === 0) {
    urlApi = `http://localhost:3000/api/wikidata/elemento?stringa=${encodeURIComponent(nomeAutore)}`;
    ris = await fetch(urlApi);
    artisti = (await ris.json()).map(p => p.title);
    }

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

    return ris;
}


let codA;
let nomCanzone;

document.addEventListener("DOMContentLoaded", function () {
    let url=new URL(window.location.href);
    const codiceArtista = url.searchParams.get('idAutore');
    const nomeCanzone = url.searchParams.get('nomeSong');
    const nomeAutore = url.searchParams.get('nomeAutore');
    codA = codiceArtista;
    nomCanzone=nomeCanzone;
    console.log(codiceArtista);
    console.log(nomeCanzone);
    document.getElementById("nomeCanzone").innerHTML = nomeCanzone;
    
    const nc = FormatSongName(nomeCanzone);
    const na =FormatArtistName(nomeAutore);

    

    GetData(codA,na,nc)
        .then(data => renderData(data)) // Handle the data
        .catch(error => console.error('Error:', error)); // Handle errors
});

function renderData(data){
   // const d=data.map(dat=>dat.nomeCanzone.value);
    console.log(data);
    const timeline=document.createElement('table');
    data.forEach(el=>{
        let tr=document.createElement('tr');
        let td=document.createElement('td');
        td.style.border="1px solid";
        td.innerHTML=el.artistaNome.value;
        tr.appendChild(td);
         td=document.createElement('td');
         td.style.border="1px solid";
        td.innerHTML=el.nomeCanzone.value;
        tr.appendChild(td);
         td=document.createElement('td');
         td.style.border="1px solid";
        td.innerHTML=el.nomeGenere.value;
        tr.appendChild(td);
        timeline.appendChild(tr);
    });
    timeline.style.borderCollapse="collapse";
    timeline.style.width="100%";
    document.getElementById("timeLine").appendChild(timeline);
    


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