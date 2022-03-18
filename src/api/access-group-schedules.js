import { useApi, fakeAccessGroups, fakePersons , fakeAccessGroupSchedule } from './api-config';
import { encodeArrayForSpring, sendApi } from './api-helpers';

class AccessGroupScheduleApi {

    getAccessGroupSchedulesWhereGroupToEntranceIdsIn(groupToEntranceIds) {
        if (useApi) { 
            return sendApi(`/api/access-group-schedule?grouptoentranceids=${encodeArrayForSpring(groupToEntranceIds)}`);
        }
    }

    createAccessGroupSchedule({
        accessGroupScheduleName,
        rrule,
        timeStart,
        timeEnd
    }, groupToEntranceIds) {
        console.log("groupTOEntranceIds", groupToEntranceIds)
        if (useApi) {
            return sendApi(
                `/api/access-group-schedule?grouptoentranceids=${encodeArrayForSpring(groupToEntranceIds)}`, 
                {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        accessGroupScheduleName,
                        rrule,
                        timeStart,
                        timeEnd
                    })
                }
            );
        }
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
            return sendApi(`/api/access-group-schedule/replace?grouptoentrancelist=${encodeArrayForSpring(groupToEntranceIds)}`, 
                {
                    method: 'PUT',
                    headers: {
                        'Content-type': 'application-json'
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
            return sendApi(`/api/access-group-schedule/add?grouptoentrancelist=${encodeArrayForSpring(groupToEntranceIds)}`, 
                {
                    method: 'PUT',
                    headers: {
                        'Content-type': 'application-json'
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

export const accessGroupScheduleApi = new AccessGroupScheduleApi();