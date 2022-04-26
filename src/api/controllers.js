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
            controller.authDevice = fakeAuthDevices.filter(d=>d.controllerId==controllerId)
            return Promise.resolve(new Response(JSON.stringify(controller), { status: 200 }));
        }

        return Promise.resolve(new Response(
            JSON.stringify({ personId: `controller with Id ${controllerId} does not exist` }),
            { status: 404 }
        ));
    }

    updateController(controller) {
        if (useApi) {
            return sendApi(`/api/controller`, 
                {
                    method: 'PUT',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(controller)
                }
            );
        }
    }

    addAccessGroupSchedules(accessGroupScheduleList, groupToEntranceIds) {
        const cleanedAccessGroupScheduleList = accessGroupScheduleList.map(
            schedule => ({
                accessGroupScheduleName: schedule.accessGroupScheduleName,
                rrule: schedule.rrule,
                timeStart: schedule.timeStart,
                timeEnd: schedule.timeEnd
            })
        );
        if (useApi) {
            return sendApi(`/api/access-group-schedule/add?grouptoentranceids=${encodeArrayForSpring(groupToEntranceIds)}`, 
                {
                    method: 'PUT',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(cleanedAccessGroupScheduleList)
                }
            );
        }
    }

    deleteAccessGroupSchedule(accessGroupScheduleId) {
        if (useApi) { return sendApi(`/api/access-group-schedule/${accessGroupScheduleId}`, { method: 'DELETE' }); }
    }
}

export const controllerApi = new ControllerApi();