
function FormatArtistName(name) {
    if (name.match(/[^\x00-\x7F]/g) !== null) {
        // trova nome in inglese tra le tonde
        const m = name.match(/\(([^)]+)\)/);
        name = m !== null ? m[1] : name;
    }

    name = name.replace(/[^\x00-\x7F]/g, "");

    const cut_index = Math.min(name.indexOf("-"), name.indexOf("("), name.indexOf("["), name.indexOf("/"));
    
    if (cut_index !== -1)
        name = name.slice(0, cut_index+1);

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

    const cut_index = Math.min(name.indexOf("-"), name.indexOf("("), name.indexOf("["), name.indexOf("/"), name.indexOf(":"));
    
    if (cut_index !== -1)
        name = name.slice(0, cut_index+1);

    name = name.replace(/^\s+|\s+$/g, "");

    return name;
}

module.exports = { FormatArtistName, FormatSongName };