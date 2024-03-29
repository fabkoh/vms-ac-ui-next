import { useApi, fake } from './api-config';
import { sendApi } from './api-helpers';

class EventslogsApi {

    getEventsCount() {
        if (useApi) { return sendApi(`/api/events/count`); }
        return Promise.resolve(new Response(JSON.stringify(controllers), { status: 200 }));
    }

    getEvents(batchNo) {
        if (useApi) { return sendApi(`/api/events?batchNo=${batchNo}`); }
        return Promise.resolve(new Response(JSON.stringify(controllers), { status: 200 }));
    }

    searchEvent(batchNo, queryString, start, end) {
        if (useApi) { return sendApi(`/api/events?batchNo=${batchNo}&queryString=${queryString}` + (start ? `&start=${start}` : ``) + (end ? `&end=${end}` : ``))}
        return Promise.resolve(new Response(JSON.stringify(controllers), { status: 200 }));
    }

    // Get unauthenticated scans in the last 24 hours
    getUnauthenticatedScans() {
        if (useApi) { return sendApi(`/api/events/unauthenticated`); }
        return Promise.resolve(new Response(JSON.stringify(controllers), { status: 200 }));
    }

    // Get unauthorised door opens in the last 24 hours
    getUnauthorisedDoorOpens() {
        if (useApi) { return sendApi(`/api/events/unauthorised`); }
        return Promise.resolve(new Response(JSON.stringify(controllers), { status: 200 }));
    }

    // Get fire alarms in the last 24 hours
    getFireAlarms() {
        if (useApi) { return sendApi(`/api/events/fire`); }
        return Promise.resolve(new Response(JSON.stringify(controllers), { status: 200 }));
    }
}

export const eventslogsApi = new EventslogsApi();