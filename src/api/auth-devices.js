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

    assignEntrance(authdevices, entranceId) {   //to remove entrance, set entranceId = null
        if (useApi) {
            return sendApi(`/api/authdevice/entrance?entranceid=${entranceId}`, 
                {
                    method: 'PUT',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(authdevices)
                }
            );
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
}

export const authDeviceApi = new AuthDeviceApi();