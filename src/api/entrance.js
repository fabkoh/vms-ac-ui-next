import { fakeEntrances, sendApi, useApi } from './api-config';

class EntranceApi {
    getEntrances() {
        if (useApi) { return sendApi('/api/entrances'); }

        return Promise.resolve(new Response(JSON.stringify(fakeEntrances), { status: 200 }));
    }

    updateEntranceStatus(entranceId, isActive) {
        if (useApi) {
            if (isActive) { return sendApi(`/api/entrance/enable/${entranceId}`, { method: 'PUT'} ); }
            return sendApi(`/api/entrance/unlock/${entranceId}`, { method: 'PUT' } );
        }
        fakeEntrances.find(entrance => entrance.entranceId == entranceId).isActive = isActive;

        return Promise.resolve(new Response(isActive, { status: 200 }));
    }
}

const entranceApi = new EntranceApi();

export default entranceApi;