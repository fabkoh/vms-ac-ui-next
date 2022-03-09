import { fakeEntrances, useApi } from './api-config';

class EntranceApi {
    getEntrances() {
        // if (useApi) { return fetch(...); }

        return Promise.resolve(new Response(JSON.stringify(fakeEntrances), { status: 200 }));
    }

    updateEntranceStatus(entranceId, isActive) {
        fakeEntrances.find(entrance => entrance.entranceId == entranceId).isActive = isActive;

        return Promise.resolve(new Response(isActive, { status: 200 }));
    }
}

const entranceApi = new EntranceApi();

export default entranceApi;