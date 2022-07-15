import { useApi } from './api-config';
import { sendApi } from './api-helpers';

class EventsManagementApi {


    getAllEventsManagement() {
        if (useApi) { return sendApi('/api/eventsmanagements'); }
        return Promise.resolve(new Response(JSON.stringify(controllers), { status: 200 }));
    }

    getEntranceEventsManagement(entranceId) {
        if (useApi) { return sendApi(`/api/eventsmanagements/entrance/${entranceId}`); }
        return Promise.resolve(new Response(JSON.stringify(controllers), { status: 200 }));
    }

    getControllerEventsManagement(controllerId) {
        if (useApi) { return sendApi(`/api/eventsmanagements/controller/${controllerId}`); }
        return Promise.resolve(new Response(JSON.stringify(controllers), { status: 200 }));
    }
}

export const eventsManagementApi = new EventsManagementApi();