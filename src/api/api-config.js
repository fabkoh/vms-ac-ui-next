// URI for back end
const apiUri = process.env.NEXT_PUBLIC_URI;

// true if using apiUri, false if using local, fake data
const useApi = false;

// fake persons data
const fakePersons = [
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
    },
    {
        "personId": 3,
        "personFirstName": "John",
        "personLastName": "Smith",
        "personUid": "abc",
        "personMobileNumber": "+65 98765432",
        "personEmail": "smith.j@mail.com"
    },
    {
        "personId": 4,
        "personFirstName": "Andy",
        "personLastName": "Tan",
        "personUid": "123",
        "personMobileNumber": "+65 91234567",
        "personEmail": "tan.a@mail.com"
    }
];

const sendApi = (path) => fetch(apiUri + path);

export { useApi, sendApi, fakePersons };