function formatDate(release_date, release_date_precision) {
    const date_str = new Date(release_date).toLocaleString();
    switch (release_date_precision) {
        case "month":
            return date_str.slice(3, 10); // "MM/YYYY"
        case "year":
            return date_str.slice(6, 10); // "YYYY"
        default:
            return date_str.slice(0, 10); // "DD/MM/YYYY"
    }
}