class PersonApi {
    getPersons() {
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

    getFakePerson(id) {
        return Promise.resolve(
            this.getPersons().find((p => p.personId == id))
        )
    }
}

export const personApi = new PersonApi();