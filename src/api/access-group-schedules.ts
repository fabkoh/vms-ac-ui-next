import { useApi } from "./api-config";
import { encodeArrayForSpring, sendApi } from "./api-helpers";
import type { AccessGroupSchedule } from "../types/models";

class AccessGroupScheduleApi {

  getAccessGroupSchedulesWhereGroupToEntranceIdsIn(groupToEntranceIds: (number | string)[]): Promise<Response> | undefined {
    if (useApi) {
      return sendApi(`/api/access-group-schedule?grouptoentranceids=${encodeArrayForSpring(groupToEntranceIds)}`);
    }
  }

  replaceAccessGroupSchedules(
    accessGroupScheduleList: AccessGroupSchedule[],
    groupToEntranceIds: (number | string)[]
  ): Promise<Response> | undefined {
    const cleanedAccessGroupScheduleList = accessGroupScheduleList.map(
      (schedule) => ({
        accessGroupScheduleName: schedule.accessGroupScheduleName,
        rrule: schedule.rrule,
        timeStart: schedule.timeStart,
        timeEnd: schedule.timeEnd,
      })
    );
    if (useApi) {
      return sendApi(`/api/access-group-schedule/replace?grouptoentranceids=${encodeArrayForSpring(groupToEntranceIds)}`,
        {
          method: "PUT",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(cleanedAccessGroupScheduleList),
        }
      );
    }
  }

  addAccessGroupSchedules(
    accessGroupScheduleList: AccessGroupSchedule[],
    groupToEntranceIds: (number | string)[]
  ): Promise<Response> | undefined {
    const cleanedAccessGroupScheduleList = accessGroupScheduleList.map(
      (schedule) => ({
        accessGroupScheduleName: schedule.accessGroupScheduleName,
        rrule: schedule.rrule,
        timeStart: schedule.timeStart,
        timeEnd: schedule.timeEnd,
      })
    );
    if (useApi) {
      return sendApi(`/api/access-group-schedule/add?grouptoentranceids=${encodeArrayForSpring(groupToEntranceIds)}`,
        {
          method: "PUT",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(cleanedAccessGroupScheduleList),
        }
      );
    }
  }

  deleteAccessGroupSchedule(accessGroupScheduleId: number | string): Promise<Response> | undefined {
    if (useApi) { return sendApi(`/api/access-group-schedule/${accessGroupScheduleId}`, { method: "DELETE" }); }
  }

  getAccessGroupStatusForSingleAccessGroup(accessGroupId: number | string): Promise<Response> | undefined {
    if (useApi) { return sendApi(`/api/access-group-schedule/current/${accessGroupId}`); }
  }

  getAccessGroupStatusForOneEntrance(entranceId: number | string): Promise<Response> | undefined {
    if (useApi) { return sendApi(`/api/access-group-schedule/current-entrance/${entranceId}`); }
  }

  getAllAccessGroupStatus(): Promise<Response> | undefined {
    if (useApi) { return sendApi(`/api/access-group-schedule/current`); }
  }

  activateAccessGroupSchedule(scheduleId: number | string): Promise<Response> | undefined {
    if (useApi) { return sendApi(`/api/access-group-schedule/enable/${scheduleId}`, { method: "PUT" }); }
  }

  deactivateAccessGroupSchedule(scheduleId: number | string): Promise<Response> | undefined {
    if (useApi) { return sendApi(`/api/access-group-schedule/disable/${scheduleId}`, { method: "PUT" }); }
  }
}

export const accessGroupScheduleApi = new AccessGroupScheduleApi();
