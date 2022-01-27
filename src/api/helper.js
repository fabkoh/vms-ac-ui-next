class ApiHelper {
    async getJsonPromise(uri) {
        const res = await fetch(uri);
        return res.json();
    }

    async getResPromise(uri) {
        return fetch(uri)
    }
}

export const apiHelper = new ApiHelper();