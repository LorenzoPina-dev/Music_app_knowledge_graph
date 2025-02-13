class Overlay {
    constructor(render_target_id, external_toggle_id, render_specific, append_target=document.body) {
        const overlay_container = document.createElement("div"),
              render_target = document.createElement("div"),
              external_toggle = document.createElement("div"),
              internal_toggle = document.createElement("button");

        overlay_container.classList.add("overlay");
        render_target.id = render_target_id;

        const f = e => e.button === 0 ? this.toggle_overlay() : void 0;

        external_toggle.classList.add("toggle", "disabled");
        external_toggle.id = external_toggle_id;
        external_toggle.onmouseup = f;

        internal_toggle.textContent = "x";
        internal_toggle.onmouseup = f;

        overlay_container.appendChild(render_target);
        overlay_container.appendChild(internal_toggle);

        this.external_toggle = external_toggle;
        this.overlay_container = overlay_container;

        this.render_target_id = render_target_id;
        this.render_object = null;
        this.markersLayer = null;
        this.overlay_is_visible = false;
        this.flush_on_hidden = "invalidateSize";

        append_target.appendChild(this.external_toggle);
        append_target.appendChild(this.overlay_container);

        this.render_specific = render_specific;
    }
    toggle_overlay() {
        if (this.overlay_is_visible) {
            document.body.classList.remove("noscroll");
            this.overlay_container.style.display = "none";
            this.overlay_container.style.pointerEvents = "none";
        }
        else {
            if (this.render_object !== null) setTimeout(this.render_object[this.flush_on_hidden], 300);
            document.body.classList.add("noscroll");
            this.overlay_container.style.display = "flex";
            this.overlay_container.style.pointerEvents = "all";
        }
        this.overlay_is_visible = !this.overlay_is_visible;
    }
    enable_external_toggle(onmouseup=undefined) {
        if (onmouseup !== undefined)
            this.external_toggle.onmouseup = onmouseup;

        this.external_toggle.classList.remove("disabled");
    }
    render(...args) {
        if (!this.overlay_is_visible)
            this.toggle_overlay();

        if (this.render_object === null)
            this.render_object = this.render_specific(this.render_target_id, ...args);
    }
}

class MapOverlay extends Overlay {
    constructor(append_target=document.body) {
        super("map", "map-toggle", render_map, append_target);
    }
}

class TimelineOverlay extends Overlay {
    constructor(append_target=document.body) {
        super("timeline", "timeline-toggle", render_timeline, append_target);
    }
}

class GenresOverlay extends Overlay {
    constructor(append_target=document.body) {
        super("genres", "genres-toggle", render_genres, append_target);
    }
}


function render_map(render_target, view_target, points, zoom=6) {
    const map = L.map(render_target, { worldCopyJump: false, minZoom: 2 }).setView(view_target, zoom);

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

    const markersLayer = L.layerGroup().addTo(map);
    
    for (let i=0; i<points.length; i++) {
        L.marker([points[i].lat, points[i].lng])
            .addTo(markersLayer)
            .bindPopup(`<b>${points[i].name}</b>`)
    }

    return map;
}

function render_timeline(render_target_id, title, subtitle, points, sort_function, map_function, formatter, dataLabelsEnabled = false) {
    return Highcharts.chart(render_target_id, {
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

function render_genres(render_target_id, title, subtitle, points, dataLabelFormatter, tooltipFormatter, onclick) {
    return Highcharts.chart(render_target_id, {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: title
        },
        subtitle: {
            text: subtitle
        },
        tooltip: {
            useHTML: true,
            formatter: tooltipFormatter
        },
        plotOptions: {
            //pie: {
            series: {
                allowPointSelect: true, // Allows clicking to select
                cursor: 'pointer',
                point: {
                    events: {
                        click: onclick
                    }
                },
                dataLabels: [{
                    enabled: true,
                    distance: 20,
                    useHTML: true,
                    formatter: dataLabelFormatter
                }, {
                    enabled: true,
                    distance: -40,
                    format: '{point.percentage:.1f}%',
                    style: {
                        fontSize: '1.2em',
                        textOutline: 'none',
                        opacity: 0.7,
                        color: "white"
                    },
                    filter: {
                        operator: '>',
                        property: 'percentage',
                        value: 5
                    }
                }]
            //}
            }
        },
        series: [
            {
                name: 'genres',
                colorByPoint: true,
                data: points
            }
        ]
    });
}

window.onload = () => {
    Highcharts.setOptions({
        colors: Highcharts.getOptions().colors.map(function (color) {
            return {
                radialGradient: {
                    cx: 0.5,
                    cy: 0.3,
                    r: 0.7
                },
                stops: [
                    [0, color],
                    [1, Highcharts.color(color).brighten(-0.3).get('rgb')] // darken
                ]
            };
        })
    });
}