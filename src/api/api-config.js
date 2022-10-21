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
        "accessGroupDesc": "the characters from Dune",
        "isActive": true,
    },
    {
        "accessGroupId": 2,
        "accessGroupName": "Not dune",
        "isActive": true,
    },
    {
        "accessGroupId": 3,
        "accessGroupName": "Empty group",
        "isActive": true,
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
const fakeControllers = [
    {
        "controllerId":1,
        "controllerName":"Controller_DefaultMAC1",
        "controllerIpStatic":false,
        "controllerIP":"192.168.1.1",
        "controllerMAC":"495162159654",
        "controllerSerialNo":"5e86805e2bafd54f66cc95c3",
        "created":"2022-18-04    09:52:23",
        "masterController":true,
        "pinAssignmentConfig":"",
        "settingsConfig":"",
        "lastOnline":"2022-18-04    09:52:23",
    },
    {
        "controllerId":2,
        "controllerName":"Controller_DefaultMAC2",
        "controllerIpStatic":"",
        "controllerIP":"",
        "controllerMAC":"",
        "controllerSerialNo":"",
        "created":"",
        "pinAssignmentConfig":"",
        "settingsConfig":"",
        "lastOnline":"",
    },

]
const fakeAuthDevices = [
    {
            "authDeviceId":"1",
            "authDeviceName":"authDevice1",
            "authDeviceDirection":"E1_IN",
            "lastOnline":"2022-08-14 08:59:52",
            "masterpin":true,
            "defaultAuthMethod":"",
            "controllerId":"1",
            "entrance":{
                "entranceId": 1,
                "entranceName": "Main Entrance",
                "entranceDesc": "the main entrance",
                "isActive": true
            },
    },
    {
            "authDeviceId":"2",
            "authDeviceName":"authDevice2",
            "authDeviceDirection":"E1_OUT",
            "lastOnline":"",
            "masterpin":false,
            "defaultAuthMethod":"",
            "controllerId":"1",
            "entrance":{
                "entranceId": 1,
                "entranceName": "Main Entrance",
                "entranceDesc": "the main entrance",
                "isActive": true
            },
    },
    {
            "authDeviceId":"3",
            "authDeviceName":"authDevice3",
            "authDeviceDirection":"E2_IN",
            "lastOnline":"",
            "masterpin":true,
            "defaultAuthMethod":"",
            "controllerId":"1",
            "entrance":null,
    },
    {
            "authDeviceId":"4",
            "authDeviceName":"authDevice4",
            "authDeviceDirection":"E2_OUT",
            "lastOnline":"",
            "masterpin":true,
            "defaultAuthMethod":"",
            "controllerId":"1",
            "entrance":null,
    },

]

const fakeVideoRecorders = [
    {
        "recorderId": 1,
        "recorderName": "Video Recorder 1",
        "recorderSerialNumber": "123ABC",
        "recorderIpAddress": "192.168.34.23",
        "recorderPortNumber": 81,
        "recorderUsername": "demo",
        "recorderPassword": "password",
        "created": "2022-06-24T10:31:35.126183"
    }, 
    {
        "recorderId": 2,
        "recorderName": "Video Recorder 2",
        "recorderSerialNumber": "123ABCD",
        "recorderIpAddress": "192.168.34.22",
        "recorderPortNumber": 80,
        "recorderUsername": "demo",
        "recorderPassword": "password",
        "created": "2022-06-24T10:31:35.126183"
    }, 
    {
        "recorderId": 3,
        "isActive": true,
        "recorderName": "Real Video Recorder",
        "recorderSerialNumber": "DS-7616NI-I21620210923CCRRG74241239WCVU",
        "recorderIpAddress": "128.106.80.68",
        "recorderPortNumber": 8085,
        "recorderChannels": [
            "IPdome"
        ],
        "recorderCameras": [
            "IPdome"
        ],
        "recorderUsername": "admin",
        "recorderPassword": "ISSNVRTest01",
        "created": "2022-07-22T07:21:00.172114"
    }
]

const fakeSMSConfig = {
    "smsSettingsId": 1,
    "smsAPI": "ThisIsTheTestingApi",
    "enabled": true
}

const fakeEmailConfig = {
    "emailSettingsId": 1,
    "username": "Lee Yong Ning",
    "email": "yongning.lee@iss.security.sg",
    "emailPassword": "TestingPassword",
    "hostAddress": "TestingHostAddress",
    "portNumber": "8080",
    "enabled": true
}

const fakeEventsManagement = []
const fakeInputEvents = [
  {
    "eventActionInputId" : 1,
    "eventActionInputName" : "name",
    "timerEnabled" : false,
    "eventActionInputConfig" : null
  }
]
const fakeOutputEvents = [
  {
    "eventActionOutputId" : 1,
    "eventActionOutputName" : "name",
    "timerEnabled" : false,
    "eventActionOutputConfig" : null
  }
]

const fakeNotifLogs = [
    {
        "notificationLogsId": 1,
        "notificationLogsStatusCode": 200,
        "notificationLogsError": "",
        "timeSent": "2022-10-21T01:48Z",
        "eventsManagementNotification": {
            "eventsManagementNotificationId": 1,
            "eventsManagementNotificationType": "EMAIL",
            "eventsManagementNotificationRecipients": "alissayarmantho1@gmail.com",
            "eventsManagementNotificationContent": "An Event Management has been triggered.",
            "eventsManagementNotificationTitle": "Event Management Triggered",
            "deleted": false,
            "eventsManagement": {
                "eventsManagementId": 1,
                "eventsManagementName": "Random",
                "inputEventsId": [
                    1
                ],
                "outputActionsId": [
                    1,
                    2
                ],
                "triggerSchedules": [
                    {
                        "triggerScheduleId": 1,
                        "triggerName": "0",
                        "rrule": "DTSTART:20221021T000000Z\nRRULE:FREQ=DAILY;INTERVAL=1;COUNT=1",
                        "timeStart": "00:00",
                        "timeEnd": "24:00"
                    }
                ]
            }
        }
    }
]
export { apiUri, useApi, fakePersons, fakeAccessGroups, fakeEntrances, fakeAccessGroupEntranceNtoN ,fakeAccessGroupSchedule, fakeControllers, fakeAuthDevices, fakeVideoRecorders, fakeSMSConfig, fakeEmailConfig, fakeEventsManagement, fakeInputEvents, fakeOutputEvents, fakeNotifLogs};