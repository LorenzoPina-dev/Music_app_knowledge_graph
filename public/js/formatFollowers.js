function formatFollowers(f) {
    const m = 1E6,
          _100k = 1E5,
          _1k = 1E3;
    if (f > m) {
        const decimal = Math.floor((f % m) / _100k)
        return `${Math.floor(f/m)}${decimal !== 0 ? `.${decimal}`: ""}M`
    }
    else if (f > _100k) {
        return `${Math.round(f / _1k)}k`
    }
    else if (f > _1k) {
        const decimal = Math.floor((f % _1k) / 100);
        return `${Math.floor(f / _1k)}${decimal !== 0 ? `.${decimal}` : ""}k`
    }
    else {
        return "< 1k";
    }
}