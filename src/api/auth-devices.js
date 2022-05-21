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
}

export const authDeviceApi = new AuthDeviceApi();