class ApiHelper {
    async getJsonPromise(uri) {
        const res = await fetch(uri);
        return res.json();
    }
}

export const apiHelper = new ApiHelper();