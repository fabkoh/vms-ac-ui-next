import { useApi, fake } from './api-config';
import { sendApi } from './api-helpers';

class EventslogsApi {

    getEvents() {
        if (useApi) { return sendApi('/api/events'); }
        return Promise.resolve(new Response(JSON.stringify(controllers), { status: 200 }));
    }

    searchEvent(queryString, start, end) {
        if (useApi) { return sendApi(`/api/events?queryString=${queryString}` + (start ? `&start=${start}` : ``) + (end ? `&end=${end}` : ``))}
        return Promise.resolve(new Response(JSON.stringify(controllers), { status: 200 }));
    }
}

export const eventslogsApi = new EventslogsApi();