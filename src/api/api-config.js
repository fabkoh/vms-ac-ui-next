// URI for back end
const apiUri = process.env.NEXT_PUBLIC_URI;

// true if using apiUri, false if using local, fake data
const useApi = process.env.NEXT_PUBLIC_USE_API || false;

// fake data
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
        "personEmail": "leto@atreides.com",
        "accessGroup": 1
    },
    {
        "personId": 3,
        "personFirstName": "John",
        "personLastName": "Smith",
        "personUid": "abc",
        "personMobileNumber": "+65 98765432",
        "accessGroup":  2
    },
    {
        "personId": 4,
        "personFirstName": "Andy",
        "personLastName": "Tan",
        "personUid": "123"
    }
];

const fakeAccessGroups = [
    {
        "accessGroupId": 1,
        "accessGroupName": "Dune",
        "accessGroupDesc": "the characters from Dune"
    },
    {
        "accessGroupId": 2,
        "accessGroupName": "Not dune"
    },
    {
        "accessGroupId": 3,
        "accessGroupName": "Empty group"
    }
]

const fakeEntrances = [
    {
        "entranceId": 1,
        "entranceName": "Main Entrance",
        "entranceDesc": "the main entrance",
        "isActive": true
    },
    {
        "entranceId": 2,
        "entranceName": "Side Entrance",
        "isActive": true
    },
    {
        "entranceId": 3,
        "entranceName": "Abandoned Entrance",
        "isActive": false
    }
]

const fakeAccessGroupEntranceNtoN = [
    {
        "groupToEntranceId": 1,
        "accessGroupId": 1,
        "entranceId": 1
    },
    {
        "groupToEntranceId": 2,
        "accessGroupId": 2,
        "entranceId": 1
    },
    {
        "groupToEntranceId": 3,
        "accessGroupId": 1,
        "entranceId": 2
    }
]

const fakeAccessGroupSchedule = [
    {
        "accessGroupScheduleId":1,
        "accessGroupScheduleName":"sched1",
        "rrule":"",
        "timeStart":"",
        "timeEnd":"",
        "groupToEntranceId": 1,
    },
    {
        "accessGroupScheduleId":1,
        "accessGroupScheduleName":"sched1",
        "rrule":"",
        "timeStart":"",
        "timeEnd":"",
        "groupToEntranceId": 1,
    }
]
const sendApi = (path, init={}) => fetch(apiUri + path, init);

export { useApi, sendApi, fakePersons, fakeAccessGroups, fakeEntrances, fakeAccessGroupEntranceNtoN ,fakeAccessGroupSchedule};