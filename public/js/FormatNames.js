function FormatArtistName(name) {
    if (name.match(/[^\x00-\x7F]/g) !== null) {
        // trova nome in inglese tra le tonde
        const m = name.match(/\(([^)]+)\)/);
        name = m !== null ? m[1] : name;
    }

    name = name.replace(/[^\x00-\x7F]/g, "");

    const indices = [name.indexOf("-"), name.indexOf("("), name.indexOf("["), name.indexOf("/")].filter(v => v !== -1);

    if (indices.length > 0)
        name = name.slice(0, Math.min(indices));

    name = name.replace(/^\s+|\s+$/g, "");

    return name;
}

function FormatSongName(name) {
    if (name.match(/[^\x00-\x7F]/g) !== null) {
        // trova nome in inglese tra le tonde
        const m = name.match(/\(([^)]+)\)/);
        name = m !== null ? m[1] : name;
    }

    name = name.replace(/[^\x00-\x7F]/g, "");

    const indices = [name.indexOf("-"), name.indexOf("("), name.indexOf("["), name.indexOf("/"), name.indexOf(":")].filter(v => v !== -1);
    
    if (indices.length > 0)
        name = name.slice(0, Math.min(indices));

    name = name.replace(/^\s+|\s+$/g, "");

    return name;
}