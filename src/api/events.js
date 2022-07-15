import { useApi, fake } from './api-config';
import { sendApi } from './api-helpers';

class EventslogsApi {

    getEvents() {
        if (useApi) { return sendApi('/api/events'); }
        return Promise.resolve(new Response(JSON.stringify(controllers), { status: 200 }));
    }
}

export const eventslogsApi = new EventslogsApi();