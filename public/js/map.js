let map = null,
    markersLayer = null;
function render_map(view_target, points,zoom=6) {
    if (map === null) {
        map = L.map("map").setView(view_target, zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        markersLayer = L.layerGroup().addTo(map);
    }
    else {
        markersLayer.clearLayers();
    }

    for (let i=0; i<points.length; i++) {
        L.marker([points[i].lat, points[i].lng])
            .addTo(markersLayer)
            .bindPopup(`<b>${points[i].name}</b>`)
    }
}

let map_overlay = null,
    map_element = null;

document.addEventListener("DOMContentLoaded", () => {
    map_overlay = document.createElement("div");
    map_overlay.classList.add("overlay");
    map_element = document.createElement("div");
    map_element.id = "map";
    const map_overlay_button = document.createElement("button");
    map_overlay_button.textContent = "x";
    map_overlay_button.onmouseup = e => e.button === 0 ? toggle_map_overlay() : void 0;

    map_overlay.appendChild(map_element);
    map_overlay.appendChild(map_overlay_button);
    document.body.appendChild(map_overlay);

    
});

let map_is_visible = false;
function toggle_map_overlay() {
    if (map_is_visible) {
        map_overlay.style.display = "none";
        map_overlay.style.pointerEvents = "none";
    }
    else {
        map_overlay.style.display = "flex";
        map_overlay.style.pointerEvents = "all";
    }
    map_is_visible = !map_is_visible;
}