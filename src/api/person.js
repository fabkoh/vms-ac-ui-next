import { useApi, sendApi, fakePersons } from './api-config'

class PersonApi {

    createPerson({ 
        personFirstName, 
        personLastName, 
        personUid, 
        personMobileNumber, 
        personEmail 
    }) {
        if (useApi) { 
            return sendApi('/api/person', {
                method: 'POST',
                header: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    personFirstName,
                    personLastName,
                    personUid,
                    personMobileNumber,
                    personEmail
                })
            }); 
        }

        const newPerson = {
            personId: Math.max(fakePersons.map(person => person.personId)) + 1,
            personFirstName,
            personLastName,
            personUid,
            personMobileNumber,
            personEmail
        }

        fakePersons.push(newPerson);

        return Promise.resolve(new Response(newPerson, { status: 201 }));
    }

    getPersons() {
        if (useApi) { return sendApi('/api/persons'); }

        return Promise.resolve(new Response(fakePersons, { status: 200 }));
    }

    getPerson(id) {
        if (useApi) { return sendApi(`/api/person/${id}`); }

        const person = fakePersons.find(p => p.personId == id)

        if (person) { 
            return Promise.resolve(new Response(person, { status: 200 }));
        }

        return Promise.resolve(new Response(
            { personId: `Person with Id ${id} does not exist` },
            { status: 404 }
            ));
    }

    updatePerson({
        personId,
        personFirstName,
        personLastName,
        personUid,
        personMobileNumber,
        personEmail
    }) {
        if (useApi) {
            return sendApi('/api/person', {
                method: 'PUT',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    personId,
                    personFirstName,
                    personLastName,
                    personUid,
                    personMobileNumber,
                    personEmail
                })
            });
        }

        const updatedPerson = {
            personId,
            personFirstName,
            personLastName,
            personUid,
            personMobileNumber,
            personEmail
        };

        const index = fakePersons.findIndex(person => person.personId == personId);

        if (index == -1) {
            return Promise.resolve(new Response(
                { personId: `Person with Id ${personId} does not exist` },
                { status: 404 }
            ));
        }

        fakePersons[index] = updatedPerson
        return Promise.resolve(new Response(updatedPerson, { status: 200 }));
    }

    deletePerson(id) {
        if (useApi) { return sendApi(`/api/persons/${id}`); }

        const index = fakePersons.findIndex(person => person.personId == id);
        if (index == -1) {
            return Promise.resolve(new Response(
                { "personId": `Person with Id ${id} does not exist` },
                { status: 404 }
            ));
        }

        fakePersons.splice(index, 1);

        return Promise.resolve(new Response({}, { status: 204 }));
    }

    uidExists(uid) {
        if (useApi) { return sendApi(`/api/persons/${uid}`); }

        return Promise.resolve(new Response(
            fakePersons.some(person => person.personUid == uid), { status: 200 }));
    }

    uidInUse(uid, id) {
        if (useApi) { return sendApi(`/api/person/uid/${id}/${uid}`); }

        return Promise.resolve(new Response(
            fakePersons.some(person => person.personUid == uid && person.personId != id),
            { status: 200 }
        ));
    }
}

export const personApi = new PersonApi();