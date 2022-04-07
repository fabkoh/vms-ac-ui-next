import { useApi, fakeAccessGroups, fakePersons , fakeAccessGroupSchedule } from './api-config';
import { encodeArrayForSpring, sendApi } from './api-helpers';

class EntranceScheduleApi {

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
        if (useApi) { return sendApi(`/api/entrance-schedule/${entranceScheduleId}`, { method: 'DELETE' }); }
    }
}

export const entranceScheduleApi = new EntranceScheduleApi();