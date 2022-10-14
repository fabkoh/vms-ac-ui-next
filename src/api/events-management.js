import { useApi, fakeInputEvents, fakeOutputEvents, fakeEventsManagement } from './api-config';
import { encodeArrayForSpring, sendApi } from './api-helpers';

class EventsManagementApi {

    createEventsManagement({
        eventsManagementName,
        inputEvents,
        outputActions,
        controllerIds,
        entranceIds,
        triggerSchedules
    }) {
        if (useApi) {
            return sendApi("/api/eventsmanagement", {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    eventsManagementName,
                    inputEvents,
                    outputActions,
                    controllerIds,
                    entranceIds,
                    triggerSchedules,
                    eventsManagementEmail,
                    eventsManagementSMS
                })
            })
        }

        newEventsManagementArr = []
        if (controllerIds && controllerIds.length > 0) {
            for (let i = 0; i < controllerIds.length; i++) {
                const newEventManagement = {
                    eventsManagementId: fakeEventsManagement.map(group => group.eventsManagementId)
                                                .reduce((a, b) => Math.max(a, b), 0) + 1,
                    eventsManagementName,
                    inputEvents,
                    outputActions,
                    controllerId: controllerIds[i],
                    entranceId: null,
                    triggerSchedules,
                    eventsManagementEmail,
                    eventsManagementSMS
                }
                fakeEventsManagement.push(newEventManagement);
                newEventsManagementArr.push(newEventManagement);
            }
        }
        if (entranceIds && entranceIds.length > 0) {
            for (let i = 0; i < entranceIds.length; i++) {
                const newEventManagement = {
                    eventsManagementId: fakeEventsManagement.map(group => group.eventsManagementId)
                                                .reduce((a, b) => Math.max(a, b), 0) + 1,
                    eventsManagementName,
                    inputEvents,
                    outputActions,
                    controllerId: null,
                    entranceId: entranceIds[i],
                    triggerSchedules
                }
                fakeEventsManagement.push(newEventManagement);
                newEventsManagementArr.push(newEventManagement);
            }
        }

        return Promise.resolve(new Response(JSON.stringify(newEventsManagementArr), { status: 201 }));
    }

    replaceEventsManagement(eventsManagementList, entranceIds, controllerIds) {
        if (useApi) {
            return sendApi(`/api/eventsmanagement/replace?entranceIds=${encodeArrayForSpring(entranceIds)}&controllerIds=${encodeArrayForSpring(controllerIds)}`, 
                {
                    method: 'PUT',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(eventsManagementList)
                }
            );
        }
    }

    addEventsManagement(eventsManagementList, entranceIds, controllerIds) {
        if (useApi) {
            return sendApi(`/api/eventsmanagement/add?entranceIds=${encodeArrayForSpring(entranceIds)}&controllerIds=${encodeArrayForSpring(controllerIds)}`, 
                {
                    method: 'PUT',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(eventsManagementList)
                }
            );
        }
    }

    getEventsManagementNotifications(eventsManagementId) {
        if (useApi) { return sendApi('api/eventsmanagement/notifications/' + eventsManagementId); }
    }

    getAllEventsManagementNotifications() {
        if (useApi) {return sendApi('api/eventsmanagement/notifications');}
    }

    getAllEventsManagement() {
        if (useApi) { return sendApi('/api/eventsmanagement'); }
        return Promise.resolve(new Response(JSON.stringify(controllers), { status: 200 }));
    }

    getEntranceEventsManagement(entranceId) {
        if (useApi) { return sendApi(`/api/eventsmanagement/entrance/${entranceId}`); }
        return Promise.resolve(new Response(JSON.stringify(controllers), { status: 200 }));
    }

    getControllerEventsManagement(controllerId) {
        if (useApi) { return sendApi(`/api/eventsmanagement/controller/${controllerId}`); }
        return Promise.resolve(new Response(JSON.stringify(controllers), { status: 200 }));
    }

    deleteEventsManagement(id){
        if (useApi) { return sendApi(`/api/eventsmanagement/${id}`, { method: 'DELETE' }); }
    }
    

    getInputEvents(forController) {
        if (useApi) { return sendApi(`/api/event/input/types?forController=${forController}`); }
        return Promise.resolve(new Response(JSON.stringify(fakeInputEvents), { status: 200 }));
    }

    getOutputEvents(forController) {
        if (useApi) { return sendApi(`/api/event/output/types?forController=${forController}`); }
        return Promise.resolve(new Response(JSON.stringify(fakeOutputEvents), { status: 200 }));
    }

    getIndividualEventsManagement(emId) {
        if (useApi) { return sendApi(`/api/eventsmanagement/${emId}`); }
        console.log("apitest")
        return Promise.resolve(new Response(JSON.stringify(eventManagement), { status: 200 }));
    }
}

export const eventsManagementApi = new EventsManagementApi();