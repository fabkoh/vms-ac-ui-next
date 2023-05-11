import { useApi, fakeAccessGroups, fakePersons , fakeAccessGroupSchedule } from './api-config';
import { encodeArrayForSpring, sendApi } from './api-helpers';

class EntranceScheduleApi {

    getEntranceSchedules() {
        if (useApi) {
            return sendApi('/api/entrance-schedule');
        }
    }

    getEntranceSchedulesWhereEntranceIdsIn(entranceIds) {
        if (useApi) { 
            return sendApi(`/api/entrance-schedule?entranceids=${encodeArrayForSpring(entranceIds)}`);
        }
    }

    replaceEntranceSchedules(entranceScheduleList, entranceIds) {
        const cleanedEntranceScheduleList = entranceScheduleList.map(
            schedule => ({
                entranceScheduleName: schedule.entranceScheduleName,
                rrule: schedule.rrule,
                timeStart: schedule.timeStart,
                timeEnd: schedule.timeEnd
            })
        );
        if (useApi) {
            return sendApi(`/api/entrance-schedule/replace?entranceids=${encodeArrayForSpring(entranceIds)}`, 
                {
                    method: 'PUT',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(cleanedEntranceScheduleList)
                }
            );
        }
    }

    addEntranceSchedules(entranceScheduleList, entranceIds) {
        const cleanedEntranceScheduleList = entranceScheduleList.map(
            schedule => ({
                entranceScheduleName: schedule.entranceScheduleName,
                rrule: schedule.rrule,
                timeStart: schedule.timeStart,
                timeEnd: schedule.timeEnd
            })
        );
        if (useApi) {
            return sendApi(`/api/entrance-schedule/add?entranceids=${encodeArrayForSpring(entranceIds)}`, 
                {
                    method: 'PUT',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(cleanedEntranceScheduleList)
                }
            );
        }
    }

    deleteEntranceSchedule(entranceScheduleId) {
        if (useApi) { return sendApi(`/api/entrance-schedule/delete/${entranceScheduleId}`, { method: 'DELETE' }); }
    }

    getCurrentEntranceStatus() {
        if (useApi) { return sendApi('/api/entrance-schedule/current'); }
    }

    getCurrentEntranceStatusForOneEntrance(entranceId) {
        if (useApi) { return sendApi(`/api/entrance-schedule/current/${entranceId}`); }
    }

    activateEntranceSchedule(scheduleId) {
        if (useApi) { return sendApi(`/api/entrance-schedule/enable/${scheduleId}`, {method: 'PUT'}); }
    }

    deactivateEntranceSchedule(scheduleId) {
        if (useApi) { return sendApi(`/api/entrance-schedule/disable/${scheduleId}`, {method: 'PUT'}); }
    }
}

export const entranceScheduleApi = new EntranceScheduleApi();