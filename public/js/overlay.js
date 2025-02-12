let map = null,
    markersLayer = null;
function render_map(view_target, points, zoom=6) {
    if (!map_is_visible)
        toggle_map_overlay();

    if (map === null) {
        map = L.map("map", { worldCopyJump: false, minZoom: 2 }).setView(view_target, zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            noWrap: true,
            bounds: [
                [-90, -180], // Southwest corner
                [90, 180]    // Northeast corner
            ],
        }).addTo(map);

        map.setMaxBounds([
            [-85, -180], // Slightly adjusted bounds to prevent tile glitches
            [85, 180]
        ]);

        map.options.maxBoundsViscosity = 1.0; // Prevents dragging beyond maxBounds

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
    map_element = null,
    map_icon = null,
    timeline_overlay = null,
    timeline_element = null,
    timeline_icon = null;
document.addEventListener("DOMContentLoaded", () => {
    map_overlay = document.createElement("div");
    map_overlay.classList.add("overlay");

    map_element = document.createElement("div");
    map_element.id = "map";

    const f = e => e.button === 0 ? toggle_map_overlay() : void 0;

    map_icon = document.createElement("div");
    map_icon.classList.add("toggle", "disabled");
    map_icon.id = "map-toggle";
    map_icon.onmouseup = f;
    
    const map_overlay_button = document.createElement("button");
    map_overlay_button.textContent = "x";
    map_overlay_button.onmouseup = f
    
    document.body.appendChild(map_icon);
    map_overlay.appendChild(map_element);
    map_overlay.appendChild(map_overlay_button);
    document.body.appendChild(map_overlay);

    const g = e => e.button === 0 ? toggle_timeline_overlay() : void 0;

    timeline_overlay = document.createElement("div");
    timeline_overlay.classList.add("overlay");

    timeline_element = document.createElement("div");
    timeline_element.id = "timeline";

    timeline_icon = document.createElement("div");
    timeline_icon.classList.add("toggle", "disabled");
    timeline_icon.id = "timeline-toggle";
    timeline_icon.onmouseup = g;
    
    const timeline_overlay_button = document.createElement("button");
    timeline_overlay_button.textContent = "x";
    timeline_overlay_button.onmouseup = g;
    
    document.body.appendChild(timeline_icon);
    timeline_overlay.appendChild(timeline_element);
    timeline_overlay.appendChild(timeline_overlay_button);
    document.body.appendChild(timeline_overlay);
});

let map_is_visible = false;
function toggle_map_overlay() {
    if (map_is_visible) {
        document.body.classList.remove("noscroll");
        map_overlay.style.display = "none";
        map_overlay.style.pointerEvents = "none";
    }
    else if (!timeline_is_visible) {
        if (map !== null) setTimeout(map.invalidateSize, 300);
        document.body.classList.add("noscroll");
        map_overlay.style.display = "flex";
        map_overlay.style.pointerEvents = "all";
    }
    map_is_visible = !map_is_visible;
}

let timeline_is_visible = false;
function toggle_timeline_overlay() {
    if (timeline_is_visible) {
        document.body.classList.remove("noscroll");
        timeline_overlay.style.display = "none";
        timeline_overlay.style.pointerEvents = "none";
    }
    else if (!map_is_visible) {
        if (timeline !== null) setTimeout(timeline.reflow, 300);
        document.body.classList.add("noscroll");
        timeline_overlay.style.display = "flex";
        timeline_overlay.style.pointerEvents = "all";
    }
    timeline_is_visible = !timeline_is_visible;
}

function enable_map_icon() {
    map_icon.classList.remove("disabled");
}

function enable_timeline_icon() {
    timeline_icon.classList.remove("disabled");
}

let timeline = null;
function render_timeline(title, subtitle, points, sort_function, map_function, formatter, dataLabelsEnabled = false) {
    if (!timeline_is_visible)
        toggle_timeline_overlay();

    timeline = Highcharts.chart('timeline', {
        chart: {
            type: 'timeline',
            zooming: {
                type: 'x',
                mouseWheel: true
            }
        },
        tooltip: {
            useHTML: true,
            hideDelay: 1000,
            formatter: formatter
        },
        xAxis: {
            type: 'datetime',
            labels: {
                staggerLines: 2
            }
        },
        yAxis: {
            visible: false
        },
        accessibility:{
            highContrastMode:"auto",
        },
        plotOptions: {
            series: {
                dataLabels: {
                    allowOverlap: false,
                    enabled: dataLabelsEnabled
                }
            }
        },
        title: {
            text: title
        },
        subtitle: {
            text: subtitle
        },
        series: [{
            data: points.sort(sort_function).map(map_function)
        }]
    });
}