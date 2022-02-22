import { useApi, sendApi, fakeAccessGroups, fakePersons } from './api-config';

class AccessGroupApi {

    createAccessGroup({
        accessGroupName,
        accessGroupDesc,
        persons
    }) {
        // if (useApi) {
        //     return sendApi(PATH, {
        //         method: 'POST',
        //         headers: {
        //             'Content-type': 'application/json'
        //         },
        //         body: JSON.stringify({
        //             accessGroupName,
        //             accessGroupDesc,
        //             person
        //         })
        //     })
        // }
        const newAccessGroup = {
            accessGroupId: fakeAccessGroups.map(group => group.accessGroupId)
                                           .reduce((a, b) => Math.max(a, b), 0) + 1,
            accessGroupName,
            accessGroupDesc,
            persons
        }

        fakeAccessGroups.push(newAccessGroup);
        // did not populate person field here as not required
        return Promise.resolve(new Response(JSON.stringify(newAccessGroup), { status: 201 }));
    }

    getAccessGroups() {
        // if (useApi) { return sendApi(PATH); }

        // did not populate person field here as not required
        return Promise.resolve(new Response(JSON.stringify(fakeAccessGroups), { status: 200 }));
    }

    getAccessGroup(id) {
        // if (useApi) { return sendApi(PATH); }

        const accessGroup = { ...fakeAccessGroups.find(group => group.accessGroupId == id) };

        if (accessGroup) {
            if(accessGroup.persons) {
                // populate the person field
                accessGroup.persons = [ ...fakePersons.filter(person => accessGroup.persons.includes(person.personId)) ];
            }
            
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
        // if (useApi) {
        //     return sendApi(PATH, {
        //         method: 'PUT',
        //         headers: {
        //             'Content-type': 'application/json'
        //         },
        //         body: JSON.stringify({
        //             accessGroupId,
        //             accessGroupName,
        //             accessGroupDesc,
        //             person
        //         })
        //     });
        // }
        const updatedAccessGroup = { accessGroupId, accessGroupName, accessGroupDesc, persons };
        const index = fakeAccessGroups.findIndex(group => group.accessGroupId == accessGroupId);

        if (index == -1) {
            // no error message as not needed
            return Promise.resolve(new Response(null, { status: 404 }));
        }

        fakeAccessGroups[index] = updatedAccessGroup;
        
        // did not populate person field as not needed
        return Promise.resolve(new Response(JSON.stringify(updatedAccessGroup), { status: 200 }));
    }

    deleteAccessGroup(id) {
        // if(useApi) { return sendApi(PATH, { method: 'DELETE' }); }

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

    nameExists(name) {
        // if (useApi) { return sendApi(PATH); }

        return Promise.resolve(new Response(fakeAccessGroups.some(group => group.accessGroupName == name), { status: 200 }));
    }
}

export const accessGroupApi = new AccessGroupApi();