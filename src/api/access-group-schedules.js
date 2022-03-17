import { useApi, sendApi, fakeAccessGroups, fakePersons , fakeAccessGroupSchedule } from './api-config';

class AccessGroupScheduleApi {

    createAccessGroupSchedule({
        accessGroupScheduleName,
        rrule,
        timeStart,
        timeEnd,
        groupToEntranceId,
    }) {
        if (useApi) {
            return sendApi("/api/access-group-schedule/create", {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    accessGroupScheduleName,
                    rrule,
                    timeStart,
                    timeEnd,
                    groupToEntranceId,
                })
            })
        }
        const newSchedule = {
            accessGroupScheduleId: fakeAccessGroupSchedule.map(group => group.accessGroupId)
                                           .reduce((a, b) => Math.max(a, b), 0) + 1,
            accessGroupScheduleName,
            rrule,
            timeStart,
            timeEnd,
            groupToEntranceId,
        }

        fakeAccessGroupSchedule.push(newSchedule);

        // did not populate person field here as not required
        return Promise.resolve(new Response(JSON.stringify(newSchedule), { status: 201 }));
    }

    getAccessGroups() {
        if (useApi) { return sendApi("/api/accessgroups"); }

        // did not populate person field here as not required
        const accessGroups = fakeAccessGroups.map(group => {
            return { ...group }
        })
        accessGroups.forEach(group => {
            const accessGroupId = group.accessGroupId;
            group.persons = fakePersons.filter(p => p.accessGroup == accessGroupId);
        })

        return Promise.resolve(new Response(JSON.stringify(accessGroups), { status: 200 }));
    }

    getAccessGroup(id) {
        if (useApi) { return sendApi(`/api/accessgroup/${id}`); }

        const accessGroup = { ...fakeAccessGroups.find(group => group.accessGroupId == id) };

        if (accessGroup) {
            const accessGroupId = accessGroup.accessGroupId;
            accessGroup.persons = fakePersons.filter(p => p.accessGroup == accessGroupId);
            
            return Promise.resolve(new Response(JSON.stringify(accessGroup), { status: 200 }));
        }

        // no error message as not needed
        return Promise.resolve(new Response(null, { status: 404 }));
    }

    updateAccessGroup ({
        accessGroupId,
        accessGroupName,
        accessGroupDesc,
        persons
    }) {
        if (useApi) {
            return sendApi("/api/accessgroup", {
                method: 'PUT',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    accessGroupId,
                    accessGroupName,
                    accessGroupDesc,
                    persons
                })
            });
        }
        const updatedAccessGroup = { accessGroupId, accessGroupName, accessGroupDesc };
        const index = fakeAccessGroups.findIndex(group => group.accessGroupId == accessGroupId);

        if (index == -1) {
            // no error message as not needed
            return Promise.resolve(new Response(null, { status: 404 }));
        }

        fakeAccessGroups[index] = updatedAccessGroup;

        const personIds = persons.map(p => p.personId);
        // update membership
        fakePersons.forEach(p => {
            if (personIds.includes(p.personId)) {
                p.accessGroup = accessGroupId;
            } else if (p.accessGroup == accessGroupId) {
                p.accessGroup = null;
            }
        })
        
        // did not populate person field as not needed
        return Promise.resolve(new Response(JSON.stringify(updatedAccessGroup), { status: 200 }));
    }

    deleteAccessGroup(id) {
        if(useApi) { return sendApi(`/api/accessgroup/${id}`, { method: 'DELETE' }); }

        const index = fakeAccessGroups.findIndex(group => group.accessGroupId == id);
        if (index == -1) {
            // no error message as not needed
            return Promise.resolve(new Response(null, { status: 404 }));
        }

        fakeAccessGroups.splice(index, 1);
        fakePersons.forEach(person => {
            if (person.accessGroup == id) {
                // remove deleted access group from person
                person.accessGroup = null;
            }
        })
        
        return Promise.resolve(new Response(null, { status: 204 }));
    }

    // nameExists(name) {
    //     // if (useApi) { return sendApi(PATH); }

    //     return Promise.resolve(new Response(fakeAccessGroups.some(group => group.accessGroupName == name), { status: 200 }));
    // }

    getAccessGroupSchedulesWhereGroupToEntranceIdsIn(groupToEntranceIds) {
        if (useApi) { 
            const groupToEntranceIdsString = JSON.stringify(groupToEntranceIds);
            return sendApi(`/api/access-group-schedule?grouptoentranceids=${encodeURIComponent(groupToEntranceIdsString.substring(1, groupToEntranceIdsString.length - 1))}`)
        }
    }
}

export const accessGroupScheduleApi = new AccessGroupScheduleApi();