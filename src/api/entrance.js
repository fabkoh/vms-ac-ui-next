import { fakeEntrances, useApi } from './api-config';

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

        /*
        const personIds = persons.map(p => p.personId);
        const accessGroupId = newAccessGroup.accessGroupId;
        fakePersons.forEach(p => {
            if (personIds.includes(p.personId)) {
                p.accessGroup = accessGroupId;
            }
        }) */

        // did not populate person field here as not required
        return Promise.resolve(new Response(JSON.stringify(newEntrance), { status: 201 }));
    }

    getEntrances() {
        // if (useApi) { return fetch(...); }

        return Promise.resolve(new Response(JSON.stringify(fakeEntrances), { status: 200 }));
    }

    updateEntranceStatus(entranceId, isActive) {
        fakeEntrances.find(entrance => entrance.entranceId == entranceId).isActive = isActive;

        return Promise.resolve(new Response(isActive, { status: 200 }));
    }
}

const entranceApi = new EntranceApi();

export default entranceApi;