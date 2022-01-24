import { apiHelper } from './helper'

class PersonApi {
    fakePersons() {
        return [
            {
                "personId": 1,
                "personFirstName": "Paul",
                "personLastName": "Atreides",
                "personUid": "lCj7sSpU",
                "personMobileNumber": "+1 1001001000",
                "personEmail": "paul@atreides.com"
            },
            {
                "personId": 2,
                "personFirstName": "Leto",
                "personLastName": "Atreides",
                "personUid": "F2VMFevJ",
                "personMobileNumber": "+1 1001001001",
                "personEmail": "leto@atreides.com"
            }
        ]
    }

    getPersons(id) {
        return Promise.resolve(this.fakePersons());
    }

    async getPersons() {
        try {
            return await apiHelper.getJsonPromise(process.env.NEXT_PUBLIC_URI + '/api/persons');
        } catch(err) {
            console.error(err);
        }
    }
    
    getFakePerson(id) {
        return Promise.resolve(
            this.fakePersons().find((p => p.personId == id))
        )
    }

    async getPerson(id) {
        try {
            return await apiHelper.getJsonPromise(process.env.NEXT_PUBLIC_URI + `/api/person/${id}`);
        } catch(err) {
            console.error(err);
        }
    }

    fakeUidExists(uid) {
        return Promise.resolve(this.fakePersons().some(person => person.personUid == uid))
    }

    async uidExists(uid) {
        try {
            return await apiHelper.getJsonPromise(process.env.NEXT_PUBLIC_URI + `/api/person/uid/${uid}`);
        } catch (err) {
            console.log(err);
        }
    }

    async createPerson(person) {
        const personDto = {
            personFirstName: person.firstName,
            personLastName: person.lastName,
            personUid: person.uid,
            personMobileNumber: person.mobileNumber,
            personEmail: person.email
        }

        try{
            const res = fetch(process.env.NEXT_PUBLIC_URI + '/api/person', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(personDto)
            });
            return res;
        } catch (err) {
            console.log(err)
        }
    }
}

export const personApi = new PersonApi();