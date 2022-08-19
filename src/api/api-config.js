// URI for back end
const apiUri = process.env.NEXT_PUBLIC_URI;

// true if using apiUri, false if using local, fake data
const useApi = process.env.NEXT_PUBLIC_USE_API || true;

// fake data
const fakePersons = [
    {
        personId: 1,
        personFirstName: "Paul",
        personLastName: "Atreides",
        personUid: "lCj7sSpU",
        personMobileNumber: "+1 1001001000",
        personEmail: "paul@atreides.com",
        accessGroup: 1
    },
    {
        personId: 2,
        personFirstName: "Leto",
        personLastName: "Atreides",
        personUid: "F2VMFevJ",
        personEmail: "leto@atreides.com",
        accessGroup: 1
    },
    {
        personId: 3,
        personFirstName: "John",
        personLastName: "Smith",
        personUid: "abc",
        personMobileNumber: "+65 98765432",
        accessGroup:  2
    },
    {
        personId: 4,
        personFirstName: "Andy",
        personLastName: "Tan",
        personUid: "123"
    }
];

const fakeAccessGroups = [
    {
        accessGroupId: 1,
        accessGroupName: "Dune",
        accessGroupDesc: "the characters from Dune"
    },
    {
        accessGroupId: 2,
        accessGroupName: "Not dune"
    },
    {
        accessGroupId: 3,
        accessGroupName: "Empty group"
    }
]

const fakeEntrances = [
    {
        entranceId: 1,
        entranceName: "Main Entrance",
        entranceDesc: "the main entrance",
        isActive: true
    },
    {
        entranceId: 2,
        entranceName: "Side Entrance",
        isActive: true
    },
    {
        entranceId: 3,
        entranceName: "Abandoned Entrance",
        isActive: false
    }
]

const fakeAccessGroupEntranceNtoN = [
    {
        groupToEntranceId: 1,
        accessGroupId: 1,
        entranceId: 1
    },
    {
        groupToEntranceId: 2,
        accessGroupId: 2,
        entranceId: 1
    },
    {
        groupToEntranceId: 3,
        accessGroupId: 1,
        entranceId: 2
    }
]

const fakeAccessGroupSchedule = [
    {
        accessGroupScheduleId: 1,
        accessGroupScheduleName: "sched1",
        rrule: "",
        timeStart: "",
        timeEnd: "",
        groupToEntranceId: 1,
    },
    {
        accessGroupScheduleId: 2,
        accessGroupScheduleName: "sched2",
        rrule:"",
        timeStart:"",
        timeEnd:"",
        groupToEntranceId: 1,
    }
]
const fakeControllers = [
    {
        controllerId:1,
        controllerName:"Controller_DefaultMAC1",
        controllerIpStatic:false,
        controllerIP:"192.168.1.1",
        controllerMAC:"495162159654",
        controllerSerialNo:"5e86805e2bafd54f66cc95c3",
        created:"2022-18-04    09:52:23",
        masterController:true,
        pinAssignmentConfig:"",
        settingsConfig:"",
        lastOnline:"2022-18-04    09:52:23",
    },
    {
        controllerId:2,
        controllerName:"Controller_DefaultMAC2",
        controllerIpStatic:"",
        controllerIP:"",
        controllerMAC:"",
        controllerSerialNo:"",
        created:"",
        pinAssignmentConfig:"",
        settingsConfig:"",
        lastOnline:"",
    },

]
const fakeAuthDevices = [
    {
            authDeviceId:"1",
            authDeviceName:"authDevice1",
            authDeviceDirection:"E1_IN",
            lastOnline:"2022-08-14 08:59:52",
            masterpin:true,
            defaultAuthMethod:"",
            controllerId:"1",
            entrance:{
                entranceId: 1,
                entranceName: "Main Entrance",
                entranceDesc: "the main entrance",
                isActive: true
            },
    },
    {
            authDeviceId:"2",
            authDeviceName:"authDevice2",
            authDeviceDirection:"E1_OUT",
            lastOnline:"",
            masterpin:false,
            defaultAuthMethod:"",
            controllerId:"1",
            entrance:{
                entranceId: 1,
                entranceName: "Main Entrance",
                entranceDesc: "the main entrance",
                isActive: true
            },
    },
    {
            authDeviceId:"3",
            authDeviceName:"authDevice3",
            authDeviceDirection:"E2_IN",
            lastOnline:"",
            masterpin:true,
            defaultAuthMethod:"",
            controllerId:"1",
            entrance:null,
    },
    {
            authDeviceId:"4",
            authDeviceName:"authDevice4",
            authDeviceDirection:"E2_OUT",
            lastOnline:"",
            masterpin:true,
            defaultAuthMethod:"",
            controllerId:"1",
            entrance:null,
    },

]

const fakeVideoRecorders = [
    {
        recorderId: 1,
        recorderName: "Video Recorder 1",
        recorderSerialNumber: "123ABC",
        recorderIpAddress: "192.168.34.23",
        recorderPortNumber: 81,
        recorderUsername: "demo",
        recorderPassword: "password",
        created: "2022-06-24T10:31:35.126183"
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

const fakeInputEvents = [
    {
        eventActionInputId : 1,
        eventActionInputName : "name1",
        timerEnabled : false,
        eventActionInputConfig : null
    },
    {
        eventActionInputId : 2,
        eventActionInputName : "name2",
        timerEnabled : true,
        eventActionInputConfig : null
    },
]

const fakeOutputEvents = [
    {
        eventActionOutputId : 1,
        eventActionOutputName : "name1",
        timerEnabled : false,
        eventActionOutputConfig : null
    },
    {
        eventActionOutputId : 2,
        eventActionOutputName : "name2",
        timerEnabled : true,
        eventActionOutputConfig : null
    }
]

const fakeEventsManagement = [
    // for entrance 
    {
        eventsManagementId: 1,
        eventsManagementName:"Events 1",
        inputEvents:[
            // input w/o timer 
            {
                inputEventId: 1,
                timerDuration: null,
                eventActionInputType: {
                    eventActionInputId: 1,
                    eventActionInputName: "Authenticated Scan",
                    timerEnabled: false
                }
            },
            // input with timer ( 30 secs )
            {
                inputEventId: 2,
                timerDuration: 30,
                eventActionInputType: {
                    eventActionInputId:2,
                    eventActionInputName: "Door Opened",
                    timerEnabled: true
                }
            }
            
        ],
        outputActions:[
            // output w/o timer 
            {
                outputEventId: 1,
                timerDuration: null,
                eventActionOutputType: {
                    eventActionOutputId: 1,
                    eventActionOutputName: "Authenticated Scan",
                    timerEnabled: false
                }
            },
            // output with timer ( 30 secs )
            {
                outputEventId: 2,
                timerDuration: 30,
                eventActionOutputType:{
                    eventActionOutputId: 2,
                    eventActionOutputName: "Buzzer buzzing",
                    timerEnabled: true
                }
            },
            // output with timer ( but choose to let it go on indefinitely )
            {
                outputEventId: 3,
                timerDuration: null,
                eventActionOutputType:{
                    eventActionOutputId: 3,
                    eventActionOutputName: "LED light",
                    timerEnabled: true
                }
            }
            
        ],
        triggerSchedules: [{
            triggerScheduleId: 1,
            triggerName: "1",
            rrule:"DTSTART:20220701T000000Z\nRRULE:FREQ=DAILY;INTERVAL=1;WKST=MO", 
            timeStart:"00:00",
            timeEnd:"12:00",
        }],
        "entrance":{
            entranceId: 3,
            entranceName: "Abandoned Entrance",
            deleted: false
        },
        "controller":null},
    
        // for controller 
        {
            eventsManagementId: 2,
            eventsManagementName: "Events 2",
            inputEvents: [
                // input w/o timer 
                {
                    inputEventId: 4,
                    timerDuration: null,
                    eventActionInputType: {
                        eventActionInputId: 4,
                        eventActionInputName: "Authenticated Scan controller",
                        timerEnabled: false
                    }
                },
                // input with timer ( 30 secs )
                {
                    inputEventId: 5,
                    timerDuration: 30,
                    eventActionInputType: {
                        eventActionInputId: 5,
                        eventActionInputName: "Door Opened",
                        timerEnabled: true
                    }
                }
                
            ],
            outputActions: [
                // output w/o timer 
                {
                    outputEventId: 4,
                    timerDuration: null,
                    eventActionOutputType: {
                        eventActionOutputId: 4,
                        eventActionOutputTypeName: "Authenticated Scan controller",
                        timerEnabled: false
                    }
                },
                // output with timer ( 30 secs )
                {
                    outputEventId: 5,
                    timerDuration: 30,
                    eventActionOutputType: {
                        eventActionOutputId: 5,
                        eventActionOutputTypeName: "Buzzer buzzing controller",
                        timerEnabled: true
                    }
                },
                // output with timer ( but choose to let it go on indefinitely )
                {
                    outputEventId: 6,
                    timerDuration: null,
                    eventActionOutputType: {
                        eventActionOutputId: 6,
                        eventActionOutputTypeName: "LED light for controller",
                        timerEnabled: true
                    }
                }
                
            ],
            triggerSchedules: {
                triggerScheduleId: 2,
                rrule: "DTSTART:20220701T000000Z\nRRULE:FREQ=DAILY;INTERVAL=1;WKST=MO", 
                timeStart: "00:00",
                timeEnd: "12:00",
            },
            entrance: null,
            controller: {
                controllerId: 2,
                controllerName: "100000005a46e105",
                deleted: false,
                controllerSerialNo: "100000005a46e105"
            }}
]

export { apiUri, useApi, fakePersons, fakeAccessGroups, fakeEntrances, fakeAccessGroupEntranceNtoN ,fakeAccessGroupSchedule, fakeControllers, fakeAuthDevices, fakeVideoRecorders, fakeInputEvents, fakeOutputEvents, fakeEventsManagement };