const BASE_API_URL = `http://localhost:3000/api/`;

async function api(path) {
    const response = await fetch(BASE_API_URL + path),
          json = await response.json();
    json.status = response.status;
    return json
}

async function post_api(path, body) {
    return await (await fetch(BASE_API_URL + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })).json()
}

const searchParams = new (class Query {
    constructor() {
        this.url = new URL(window.location.href); 
    }
    getNumber(param) {
        const v = Number(this.url.searchParams.get(param));
        return v !== v ? 0 : v;
    }
    getBoolean(param) {
        return this.url.searchParams.get(param) === "true";
    }
    getString(param) {
        return this.url.searchParams.get(param) || "";
    }
});