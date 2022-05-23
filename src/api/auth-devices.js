import { useApi, fakeAccessGroups, fakePersons , fakeAccessGroupSchedule, fakeControllers, fakeAuthDevices } from './api-config';
import { encodeArrayForSpring, sendApi } from './api-helpers';

class AuthDeviceApi {
    
    getAuthDevice(authDeviceId) {
        if (useApi) { 
            return sendApi(`/api/authdevice/${authDeviceId}`); //change to auth device api
        }
        const authDevice = fakeAuthDevices.find(dev => dev.authDeviceId==authDeviceId)

        if(authDevice){
            return Promise.resolve(new Response(JSON.stringify(authDevice), { status: 200 }));
        }

        return Promise.resolve(new Response(
            JSON.stringify({ personId: `auth device with Id ${authDeviceId} does not exist` }),
            { status: 404 }
        ));
    }

    updateAuthdevice(authdevice, authdeviceId) {
        if (useApi) {
            return sendApi(`/api/authdevice/${authdeviceId}`, 
                {
                    method: 'PUT',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(authdevice)
                }
            );
        }
    }
    
    getAvailableEntrances(){
        if(useApi){
            return sendApi(`/api/availableEntrances`);
        }
    }

    assignEntrance(authDeviceList) {   //to remove entrance, set entranceId = null
        const toUpdate = authDeviceList.map(dev=>{
            if(dev.entrance){
                return ({authDeviceId:dev.authDeviceId,entranceId:dev.entrance.entranceId})
            }
            else{
                return ({authDeviceId:dev.authDeviceId,entranceId:null})
            }
        })
        if (useApi) {
            if(toUpdate[0].entranceId){
            return sendApi(`/api/authdevice/entrance?entranceid=${toUpdate[0].entranceId}`, 
                {
                    method: 'PUT',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(toUpdate)
                }
            )}
            else{
                return sendApi(`/api/authdevice/entrance`, 
                {
                    method: 'PUT',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(toUpdate)
                }
            )
            }
        }
    }
    removeEntrance(authDeviceList) {   //to remove entrance, set entranceId = null
        // console.log("authDeviceList",authDeviceList)
        const toUpdate = authDeviceList.map(dev=>({
            authDeviceId:dev.authDeviceId,
        }))    
        if (useApi) {        
                return sendApi(`/api/authdevice/entrance`, 
                {
                    method: 'PUT',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(toUpdate)
                }
            )
            
        }
    }

    enableMasterpin(authdeviceId) {
        if (useApi) { return sendApi(`/api/authdevice/masterpinToTrue/${authdeviceId}`, { method: 'PUT' }); }
    }

    disableMasterpin(authdeviceId) {
        if (useApi) { return sendApi(`/api/authdevice/masterpinToFalse/${authdeviceId}`, { method: 'PUT' }); }
    }

    deleteAuthdevice(authdeviceId) {
        if (useApi) { return sendApi(`/api/authdevice/delete/${authdeviceId}`, { method: 'DELETE' }); }
    }

    resetAuthDevice(authdeviceId) {
        if (useApi) { return sendApi(`/api/authdevice/reset/${authdeviceId}`, { method: 'DELETE' }); }
    }

    getAllAuthMethods() {
        if (useApi) { return sendApi(`/api/allAuthMethods`, { method: 'GET' }); }
        

        const allAuthMethods = [
            {"authMethodId":1, "authMethodDesc":"CardAndPin"},
            {"authMethodId":2, "authMethodDesc":"CardOrPin"},
            {"authMethodId":3, "authMethodDesc":"Card"},
            {"authMethodId":4, "authMethodDesc":"CardAndFingerPrint"}
        ]

        return Promise.resolve(new Response(JSON.stringify(allAuthMethods), { status: 200 }));
    }

    getAuthenticationSchedules() {
        const allAuthenticationSchedules = [
            {
                "authenticationScheduleId": 1,
                "authenticationScheduleName": "Default Schedule",
                "rrule": "DTSTART:20220517T000000Z;RRULE:FREQ=DAILY;INTERVAL=1;WKST=MO	",
                "timeStart": "00:00",
                "timeEnd": "23:59",
                "authMethod": {"authMethodId":1, "authMethodDesc":"CardAndPin"},
            },
            {
                "authenticationScheduleId": 2,
                "authenticationScheduleName": "Weekdays 9 to 5",
                "rrule": "DTSTART:20220517T000000Z;RRULE:FREQ=WEEKLY;INTERVAL=1;WKST=MO;BYDAY=MO,TU,WE,TH,FR",
                "timeStart": "09:00",
                "timeEnd": "17:00",
                "authMethod": {"authMethodId":2, "authMethodDesc":"CardOrPin"},
            },
            {
                "authenticationScheduleId": 3,
                "authenticationScheduleName": "Weekends 12 to 2",
                "rrule": "DTSTART:20220517T000000Z;RRULE:FREQ=WEEKLY;INTERVAL=1;WKST=MO;BYDAY=SA,SU",
                "timeStart": "12:00",
                "timeEnd": "17:00",
                "authMethod": {"authMethodId":3, "authMethodDesc":"Card"},
            }
        ]
        return Promise.resolve(new Response(JSON.stringify(allAuthenticationSchedules), { status: 200 }));
    }
}

export const authDeviceApi = new AuthDeviceApi();