import { useApi } from './api-config';
import { encodeArrayForSpring, sendApi } from './api-helpers';

class AuthMethodScheduleApi {

    getEntranceSchedulesWhereEntranceIdsIn( authDeviceIds) {
        if (useApi) { 
            return sendApi(`/api/authentication-schedule?authDeviceids=${encodeArrayForSpring(authDeviceIds)}`);
        }
    }

    replaceAuthDeviceSchedules(authMethodScheduleList, authDeviceIds) {
        const cleanedauthMethodScheduleList = authMethodScheduleList.map(
            schedule => ({
                authMethodScheduleName: schedule.authMethodScheduleName,
                rrule: schedule.rrule,
                timeStart: schedule.timeStart,
                timeEnd: schedule.timeEnd,
                authMehod: schedule.authMethod,
            })
        );
        if (useApi) {
            return sendApi(`/api/authentication-schedule/replace?authDeviceids=${encodeArrayForSpring(authDeviceIds)}`, 
                {
                    method: 'PUT',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(cleanedauthMethodScheduleList)
                }
            );
        }
    }

    addAuthDeviceSchedules(authMethodScheduleList, authDeviceIds) {
        const cleanedauthMethodScheduleList = authMethodScheduleList.map(
            schedule => ({
                authMethodScheduleName: schedule.authMethodScheduleName,
                rrule: schedule.rrule,
                timeStart: schedule.timeStart,
                timeEnd: schedule.timeEnd,
                authMehod: schedule.authMethod,
            })
        );
        if (useApi) {
            return sendApi(`/api/authentication-schedule/add?authDeviceids=${encodeArrayForSpring(authDeviceIds)}`, 
                {
                    method: 'PUT',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(cleanedauthMethodScheduleList)
                }
            );
        }
    }

    deleteAuthDeviceSchedule(authMethodScheduleId) {
        if (useApi) { return sendApi(`/api/entrance-schedule/delete/${authMethodScheduleId}`, { method: 'DELETE' }); }
    }
}

export const authMethodScheduleApi = new AuthMethodScheduleApi();