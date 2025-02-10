function formatAlbumMs(ms) {
    const sec = 1000,
          min = 60000,
          hour = 3600000,
          day = 24 * hour;

    if (ms > day) {
        return "> 24h";
    }

    const seconds = Math.floor((ms % min) / sec),
          minutes = Math.floor((ms % hour) / min),
          hours = Math.floor(ms / hour);

    const vh = hours !== 0,
          vm = minutes !== 0 && minutes !== 60,
          vs = seconds !== 0 && seconds !== 60;

    if (!vh && !vm && !vs)
        return "0s";

    let out = "";

    if (vh)
        out += `${hours}h`;

    if (vm)
        out += `${vh ? " " : ""}${minutes}m`;
    
    if (vs)
        out += `${vm||vh ? " " : ""}${seconds}s`;

    return out;
}

function formatMs(ms) {
    const sec = 1000,
          min = 60000,
          hour = 3600000,
          day = 24 * hour;

    if (ms > day) {
        return "> 24h";
    }

    const seconds = Math.floor((ms % min) / sec),
          minutes = Math.floor((ms % hour) / min),
          hours = Math.floor(ms / hour);

    const vh = hours !== 0;

    let out = "";

    if (vh)
        out += `${hours.toString().padStart(2,'0')}`;

    out += `${vh ? ":" : ""}${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;

    return out;
}