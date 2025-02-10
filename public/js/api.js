const BASE_API_URL = `http://localhost:3000/api/`;

async function api(path) {
    return await (await fetch(BASE_API_URL + path)).json()
}

async function post_api(path, body) {
    return await (await fetch(BASE_API_URL + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })).json()
}