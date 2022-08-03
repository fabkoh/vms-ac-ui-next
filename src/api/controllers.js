import toast from 'react-hot-toast';
import { useApi, fakeAccessGroups, fakePersons , fakeAccessGroupSchedule, fakeControllers, fakeAuthDevices } from './api-config';
import { encodeArrayForSpring, sendApi } from './api-helpers';

class ControllerApi {

    getControllers() {
        if (useApi) { 
            return sendApi(`/api/controllers`);
        }
        const controllers = fakeControllers.map(controller => {
            return{...controller}
        })
        controllers.forEach(controller => {
                // populate authDevice
                controller.authDevice = fakeAuthDevices.filter(device => device.controllerId == controller.controllerId);

            return controller
        })
        return Promise.resolve(new Response(JSON.stringify(controllers), { status: 200 }));
    }
    
    getController(controllerId) {
        if (useApi) { 
            return sendApi(`/api/controller/${controllerId}`);
        }
        const controller = fakeControllers.find(c => c.controllerId==controllerId)

        if(controller){
            controller.authDevices = fakeAuthDevices.filter(d=>d.controllerId==controllerId)
            return Promise.resolve(new Response(JSON.stringify(controller), { status: 200 }));
        }

        return Promise.resolve(new Response(
            JSON.stringify({ personId: `controller with Id ${controllerId} does not exist` }),
            { status: 404 }
        ));
    }

    updateController({
        controllerId,
        controllerIP,
        controllerName,
        controllerIPStatic,
        controllerMAC,
        controllerSerialNo,
    }) {
        if (useApi) {
            return sendApi(`/api/controller/${controllerId}`, 
                {
                    method: 'PUT',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        controllerId,
                        controllerIP,
                        controllerName,
                        controllerIPStatic,
                        controllerMAC,
                        controllerSerialNo,
                    })
                }
            );
        }
    }

    

    deleteController(controllerId) {
        if (useApi) { return sendApi(`/api/controller/delete/${controllerId}`, { method: 'DELETE' }); }
    }
    
    getAuthStatus(controllerId){
        if(useApi){return sendApi(`/api/controllerConnection/${controllerId}`)}
    }
    
    resetController(controllerId) {
        if (useApi) { return sendApi(`/api/controller/reset/${controllerId}`, { method: 'DELETE' }); }
    }

    uniconUpdater() {
        if (useApi) { return sendApi(`/api/uniconUpdater`, { method: 'POST' })
        .then( res => {
                if(res.status == 200){
                    toast.success('Synced successfully',{duration:2000},);
                }
                else{
                    toast.error('Synced unsuccessfully' )
                }
            })
        }}
    



}

export const controllerApi = new ControllerApi();