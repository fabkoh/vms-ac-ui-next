import { useApi, sendApi, fakePersons, fakeAccessGroups } from './api-config';

class PersonApi {

    createPerson({ 
        personFirstName, 
        personLastName, 
        personUid, 
        personMobileNumber, 
        personEmail,
        accessGroup
    }) {
        if (useApi) { 
            return sendApi('/api/person', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    personFirstName,
                    personLastName,
                    personUid,
                    personMobileNumber,
                    personEmail,
                    accessGroup
                })
            }); 
        }

        const newPerson = {
            personId: fakePersons.map(p => p.personId)
                                 .reduce((a, b) => Math.max(a, b), 0) + 1,
            personFirstName,
            personLastName,
            // if no uid, generate random uid
            personUid: (personUid || String(Math.floor(Math.random() * (10 ** 8)))),
            personMobileNumber,
            personEmail,
            accessGroup
        }

        fakePersons.push(newPerson);

        // did not populate access group as not required
        return Promise.resolve(new Response(JSON.stringify(newPerson), { status: 201 }));
    }

    getPersons() {
        if (useApi) { return sendApi('/api/persons'); }

        const persons = [ ...fakePersons ]

        persons.map(person => {
            if (person.accessGroup) {
                // populate access group
                person.accessGroup = { ...fakeAccessGroups.find(group => group.accessGroupId == person.accessGroup) };
            } 
            return person
        })
        return Promise.resolve(new Response(JSON.stringify(persons), { status: 200 }));
    }

    getPerson(id) {
        if (useApi) { return sendApi(`/api/person/${id}`); }

        const person = { ...fakePersons.find(p => p.personId == id)}

        if (person) { 
            if (person.accessGroup) {
                // populate access group
                person.accessGroup = { ...fakeAccessGroups.find(group => group.accessGroupId == person.accessGroup)};
            }
            return Promise.resolve(new Response(JSON.stringify(person), { status: 200 }));
        }

        return Promise.resolve(new Response(
            JSON.stringify({ personId: `Person with Id ${id} does not exist` }),
            { status: 404 }
        ));
    }

    updatePerson({
        personId,
        personFirstName,
        personLastName,
        personUid,
        personMobileNumber,
        personEmail,
        accessGroup
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
                    personEmail,
                    accessGroup
                })
            });
        }

        const updatedPerson = {
            personId,
            personFirstName,
            personLastName,
            personUid,
            personMobileNumber,
            personEmail,
            accessGroup
        };

        const index = fakePersons.findIndex(person => person.personId == personId);

        if (index == -1) {
            return Promise.resolve(new Response(
                JSON.stringify({ personId: `Person with Id ${personId} does not exist` }),
                { status: 404 }
            ));
        }

        fakePersons[index] = updatedPerson;
        return Promise.resolve(new Response(JSON.stringify(updatedPerson), { status: 200 }));
    }

    deletePerson(id) {
        if (useApi) { return sendApi(`/api/person/${id}`, { method: 'DELETE' }); }

        const index = fakePersons.findIndex(person => person.personId == id);
        if (index == -1) {
            return Promise.resolve(new Response(
                JSON.stringify({ "personId": `Person with Id ${id} does not exist` }),
                { status: 404 }
            ));
        }

        fakePersons.splice(index, 1);
        fakeAccessGroups = fakeAccessGroups.forEach(group => {
            // remove deleted person id from access group
            group.person = group.person.filter(personId => personId != id);
        })

        return Promise.resolve(new Response(null, { status: 204 }));
    }

    uidExists(uid) { //if it exists db
        if (useApi) { return sendApi(`/api/person/uid/${uid}`); }

        return Promise.resolve(new Response(
            JSON.stringify(fakePersons.some(person => person.personUid == uid)),
            { status: 200 }));
    }

    uidInUse(uid, id) { //if it is in use by others
        if (useApi) { return sendApi(`/api/person/uid/${id}/${uid}`); }

        return Promise.resolve(new Response(
            JSON.stringify(fakePersons.some(person => person.personUid == uid && person.personId != id)),
            { status: 200 }
        ));
    }

    mobileNumberExists(mobileNumber) { //for create person
        if (useApi) { return sendApi(`/api/person/mobileNumber/${mobileNumber}`); }

        return Promise.resolve(new Response(
            JSON.stringify(fakePersons.some(person => person.personMobileNumber == mobileNumber)),
            { status: 200 }));
    }

    emailExists(email) { //for create person
        if (useApi) { return sendApi(`/api/person/email/${email}`); }

        return Promise.resolve(new Response(
            JSON.stringify(fakePersons.some(person => person.personEmail == email)),
            { status: 200 }));
    }

}

export const personApi = new PersonApi();