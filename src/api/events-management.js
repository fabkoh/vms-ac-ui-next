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
                    triggerSchedules
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
                    triggerSchedules
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

    getEventsManagement() {
        if (useApi) { return sendApi('/api/eventsmanagement'); }
        return Promise.resolve(new Response(JSON.stringify(fakeEventsManagement), { status: 200 }));
    }

    getEventsManagementForEntrance(id) {
        if (useApi) { return sendApi(`/api/eventsmanagement/entrance/${id}`); }
        const filteredFakeEventsManagement = fakeEventsManagement.filter(i => i.entrance);
        return Promise.resolve(new Response(filteredFakeEventsManagement), { status: 200 })
    }

    getEventsManagementForController(id) {
        if (useApi) { return sendApi(`/api/eventsmanagement/controller/${id}`); }
        const filteredFakeEventsManagement = fakeEventsManagement.filter(i => i.controller);
        return Promise.resolve(new Response(filteredFakeEventsManagement), { status: 200 })
    }

    getInputEvents(forController) {
        if (useApi) { return sendApi(`/api/event/input/types?forController=${forController}`); }
        return Promise.resolve(new Response(JSON.stringify(fakeInputEvents), { status: 200 }));
    }

    getOutputEvents(forController) {
        if (useApi) { return sendApi(`/api/event/output/types?forController=${forController}`); }
        return Promise.resolve(new Response(JSON.stringify(fakeOutputEvents), { status: 200 }));
    }

    deleteEventsManagement(id){
        if (useApi) { return sendApi(`/api/eventsmanagement/${id}`, { method: 'DELETE' }); }
    }
}

export const eventsManagementApi = new EventsManagementApi();