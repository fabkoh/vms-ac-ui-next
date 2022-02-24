// URI for back end
const apiUri = process.env.NEXT_PUBLIC_URI;

// true if using apiUri, false if using local, fake data
const useApi = process.env.NEXT_PUBLIC_USE_API || true;

// fake persons data
const fakePersons = [
    {
        "personId": 1,
        "personFirstName": "Paul",
        "personLastName": "Atreides",
        "personUid": "lCj7sSpU",
        "personMobileNumber": "+1 1001001000",
        "personEmail": "paul@atreides.com",
        "accessGroup": 1
    },
    {
        "personId": 2,
        "personFirstName": "Leto",
        "personLastName": "Atreides",
        "personUid": "F2VMFevJ",
        "personMobileNumber": "+1 1001001001",
        "personEmail": "leto@atreides.com",
        "accessGroup": 1
    },
    {
        "personId": 3,
        "personFirstName": "John",
        "personLastName": "Smith",
        "personUid": "abc",
        "personMobileNumber": "+65 98765432",
        "personEmail": "smith.j@mail.com",
        "accessGroup":  2
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

const fakeAccessGroups = [
    {
        "accessGroupId": 1,
        "accessGroupName": "Dune",
        "accessGroupDesc": "the characters from Dune",
        "persons": [1,2]
    },
    {
        "accessGroupId": 2,
        "accessGroupName": "Not dune",
        "persons":[3]
    },
    {
        "accessGroupId": 3,
        "accessGroupName": "Empty group"
    }
]

const sendApi = (path, init={}) => fetch(apiUri + path, init);

export { useApi, sendApi, fakePersons, fakeAccessGroups };