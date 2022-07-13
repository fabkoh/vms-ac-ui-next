import { useApi } from "./api-config";
import { sendApi } from "./api-helpers";

class EventsManagementApi {

    getForController(controllerId) {
        return sendApi(`/api/controller/${controllerId}/eventsmanagement`, {method : 'GET'});
    }

    deleteById(emId) {
        return sendApi(`/api/eventsmanagement/${emId}`, {method : 'DELETE'});
    }
}

export const eventsManagementApi = new EventsManagementApi();