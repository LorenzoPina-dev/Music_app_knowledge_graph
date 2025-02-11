const maxPlaylistPerPage = 48;
let content = null;

document.addEventListener("DOMContentLoaded", async function () {
    const filtro = searchParams.getString("filtro"),
          offset = searchParams.getNumber("offset"),
          limit = (await api("numeroPlaylist")).numPlaylist;

    const data = await api(`getNplaylist?max=${200}&start=${offset}&filtro=${filtro}`);
    renderData(data, filtro, offset, maxPlaylistPerPage, limit);
});

function createForm(action, param, placeholder, button_text) {
    const form = document.createElement("form"),
          text = document.createElement("input"),
          button = document.createElement("input");

    form.action = action;
    form.method = "get";

    text.type = "text";
    text.id = param;
    text.name = param;
    text.placeholder = placeholder;

    button.type = "submit";
    button.value = button_text;

    form.appendChild(text);
    form.appendChild(button);

    return form;
}

function renderData(arr, filtro, offset, numPlaylistPagina, totalePlaylist) {
    const container = document.createElement("div"),
          h1 = document.createElement("h1");
    container.id = "container";
    h1.textContent = "Playlists";
    

    const div_form = document.createElement("div"),
          spotify_form = createForm("/playlist.html", "idSpotify", "link/id spotify", "usa"),
          internal_form = createForm("", "filtro", "nome playlist locale", "&#128269;");

    div_form.append(spotify_form, internal_form);
    document.body.prepend(h1, div_form);

    for (let i = 0; i < Math.min(arr.length,numPlaylistPagina); i++) {
        const div = document.createElement("div"), a = document.createElement("a"),
              name = arr[i].name;
        a.textContent = name;
        a.href = `/playlist.html?idPlaylist=${arr[i].pid}&nomePlaylist=${name}`;

        div.appendChild(a);
        container.appendChild(div);
    }

    if (arr.length > numPlaylistPagina) {

        const navigate = document.createElement("div"),
            left_button = document.createElement("div"),
            left_a = document.createElement("a"),
            right_button = document.createElement("div"),
            right_a = document.createElement("a");

        navigate.classList.add("navigate");

        const left_limit = offset - numPlaylistPagina < 0 ? 0 : offset - numPlaylistPagina,
              right_limit = offset + numPlaylistPagina;
        left_a.textContent = "<";
        right_a.textContent = ">";

        const back = e => e.button === 0 ? window.location.assign(`/index.html?${filtro===""?"":`filtro=${encodeURIComponent(filtro)}&`}offset=${left_limit}`) : void 0,
              forward = e => e.button === 0 ? window.location.assign(`/index.html?${filtro===""?"":`filtro=${encodeURIComponent(filtro)}&`}offset=${right_limit}`) : void 0;

        if (offset !== 0)
            left_button.onmouseup = back;
        else
            left_button.classList.add("blocked");

        if (right_limit < totalePlaylist)
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

        window["test"] = navigate_clone;

        document.body.appendChild(navigate);
        document.body.appendChild(container);
        document.body.appendChild(navigate_clone);
    }
    else {
        document.body.appendChild(container);
    }
}

