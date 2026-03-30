import { sendApi } from './api-helpers';

class VisitorsApi {
    getScheduledVisits() {
        return sendApi('/api/scheduled-visits');
    }
}

export const visitorsApi = new VisitorsApi();
