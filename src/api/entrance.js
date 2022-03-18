import { fakeEntrances, useApi, fakeAccessGroups } from './api-config';
import { sendApi } from './api-helpers';

class EntranceApi {

    createEntrance({
        entranceName,
        entranceDesc,
        accessGroups
    }) {
        if (useApi) {
            return sendApi("/api/entrance", {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    entranceName,
                    entranceDesc,
                    accessGroups
                })
            })
        }

        const newEntrance = {
            entranceId: fakeEntrances.map(group => group.entranceId)
                                           .reduce((a, b) => Math.max(a, b), 0) + 1,
            entranceName,
            entranceDesc
        }

        fakeEntrances.push(newEntrance);

        
        const accessGroupIds = accessGroups.map(p => p.accessGroupId);
        const entranceId = newEntrance.entranceId;
        fakeAccessGroups.forEach(p => {
            if (accessGroupIds.includes(p.entranceId)) {
                p.entrance = entranceId;
            }
        })

        // did not populate person field here as not required
        return Promise.resolve(new Response(JSON.stringify(newEntrance), { status: 201 }));
    }

    getEntrances() {
        if (useApi) { return sendApi('/api/entrances'); }

        return Promise.resolve(new Response(JSON.stringify(fakeEntrances), { status: 200 }));
    }

    getEntrance(id) {
        if (useApi) { return sendApi(`/api/entrance/${id}`); }

        const entrance = { ...fakeEntrances.find(entrance => entrance.entranceId == id) };

        if (entrance) {
            const entranceId = entrance.entranceId;
            entrance.accessGroups = fakeAccessGroups.filter(p => p.entrance == entranceId);
            
            return Promise.resolve(new Response(JSON.stringify(entrance), { status: 200 }));
        }

        return Promise.resolve(new Response(null, { status: 404 }));
    }

    updateEntrance ({
        entranceId,
        entranceName,
        entranceDesc,
        accessGroups
    }) {
        if (useApi) {
            return sendApi("/api/entrance", {
                method: 'PUT',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    entranceId,
                    entranceName,
                    entranceDesc,
                    accessGroups
                })
            });
        }
        const updatedEntrance = { entranceId, entranceName, entranceDesc };
        const index = fakeEntrances.findIndex(e => e.entranceId == entranceId);

        if (index == -1) {
            // no error message as not needed
            return Promise.resolve(new Response(null, { status: 404 }));
        }

        fakeEntrances[index] = updatedEntrance;

        const accessGroupIds = accessGroups.map(grp => grp.accessGroupId);
        // update membership
        fakeAccessGroups.forEach(p => {
            if (accessGroupIds.includes(p.accessGroupId)) {
                p.entrance = entranceId;
            } else if (p.entrance == entranceId) {
                p.entrance = null;
            }
        })
        
        // did not populate person field as not needed
        return Promise.resolve(new Response(JSON.stringify(updatedEntrance), { status: 200 }));
    }

    updateEntranceStatus(entranceId, isActive) {
        if (useApi) {
            if (isActive) {
                return sendApi(`/api/entrance/enable/${entranceId}`, { method: 'PUT' })
            } else {
                return sendApi(`/api/entrance/unlock/${entranceId}`, { method: 'PUT' })
            }
        }

        fakeEntrances.find(entrance => entrance.entranceId == entranceId).isActive = isActive;

        return Promise.resolve(new Response(isActive, { status: 200 }));
    }
}

const entranceApi = new EntranceApi();

export default entranceApi;