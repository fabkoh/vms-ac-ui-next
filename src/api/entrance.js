import { fakeEntrances, useApi } from './api-config';

class EntranceApi {
    getEntrances() {
        // if (useApi) { return fetch(...); }

        return Promise.resolve(new Response(JSON.stringify(fakeEntrances), { status: 200 }));
    }
}

const entranceApi = new EntranceApi();

export default entranceApi;