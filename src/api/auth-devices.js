import { useApi, fakeAccessGroups, fakePersons , fakeAccessGroupSchedule, fakeControllers, fakeAuthDevices } from './api-config';
import { encodeArrayForSpring, sendApi } from './api-helpers';

class AuthDeviceApi {

    // getAuthDevices() {
    //     if (useApi) { 
    //         return sendApi(`/api/controllers`);
    //     }
    //     const controllers = fakeControllers.map(controller => {
    //         return{...controller}
    //     })
    //     controllers.forEach(controller => {
    //             // populate authDevice
    //             controller.authDevice = fakeAuthDevices.filter(device => device.controllerId == controller.controllerId);

    //         return controller
    //     })
    //     return Promise.resolve(new Response(JSON.stringify(controllers), { status: 200 }));
    // }
    
    getAuthDevice(authDeviceId) {
        if (useApi) { 
            return sendApi(`/api/controller/${controllerId}`); //change to auth device api
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

    replaceAccessGroupSchedules(accessGroupScheduleList, groupToEntranceIds) {
        const cleanedAccessGroupScheduleList = accessGroupScheduleList.map(
            schedule => ({
                accessGroupScheduleName: schedule.accessGroupScheduleName,
                rrule: schedule.rrule,
                timeStart: schedule.timeStart,
                timeEnd: schedule.timeEnd
            })
        );
        if (useApi) {
            return sendApi(`/api/access-group-schedule/replace?grouptoentranceids=${encodeArrayForSpring(groupToEntranceIds)}`, 
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

export const authDeviceApi = new AuthDeviceApi();