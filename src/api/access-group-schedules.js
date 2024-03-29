import { useApi, fakeAccessGroups, fakePersons , fakeAccessGroupSchedule } from './api-config';
import { encodeArrayForSpring, sendApi } from './api-helpers';

class AccessGroupScheduleApi {

    getAccessGroupSchedulesWhereGroupToEntranceIdsIn(groupToEntranceIds) {
        if (useApi) { 
            return sendApi(`/api/access-group-schedule?grouptoentranceids=${encodeArrayForSpring(groupToEntranceIds)}`);
        }
    }

    // no longer in use
    // createAccessGroupSchedule({
    //     accessGroupScheduleName,
    //     rrule,
    //     timeStart,
    //     timeEnd
    // }, groupToEntranceIds) {
    //     console.log("groupTOEntranceIds", groupToEntranceIds)
    //     if (useApi) {
    //         return sendApi(
    //             `/api/access-group-schedule?grouptoentranceids=${encodeArrayForSpring(groupToEntranceIds)}`, 
    //             {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-type': 'application/json'
    //                 },
    //                 body: JSON.stringify({
    //                     accessGroupScheduleName,
    //                     rrule,
    //                     timeStart,
    //                     timeEnd
    //                 })
    //             }
    //         );
    //     }
    // }

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

    getAccessGroupStatusForSingleAccessGroup(accessGroupId) {
        if (useApi) { return sendApi(`/api/access-group-schedule/current/${accessGroupId}`); }
    }

    getAccessGroupStatusForOneEntrance(entranceId) {
        if (useApi) { return sendApi(`/api/access-group-schedule/current-entrance/${entranceId}`); }
    }

    getAllAccessGroupStatus() {
        if (useApi) { return sendApi(`/api/access-group-schedule/current`); }
    }

    activateAccessGroupSchedule(scheduleId) {
        if (useApi) { return sendApi(`/api/access-group-schedule/enable/${scheduleId}`, {method: 'PUT'}); }
    }

    deactivateAccessGroupSchedule(scheduleId) {
        if (useApi) { return sendApi(`/api/access-group-schedule/disable/${scheduleId}`, {method: 'PUT'}); }
    }
}

export const accessGroupScheduleApi = new AccessGroupScheduleApi();