import { useApi } from "./api-config";
import { encodeArrayForSpring, sendApi } from "./api-helpers";
import type { EntranceSchedule } from "../types/models";

class EntranceScheduleApi {

  getEntranceSchedules(): Promise<Response> | undefined {
    if (useApi) {
      return sendApi("/api/entrance-schedule");
    }
  }

  getEntranceSchedulesWhereEntranceIdsIn(entranceIds: (number | string)[]): Promise<Response> | undefined {
    if (useApi) {
      return sendApi(`/api/entrance-schedule?entranceids=${encodeArrayForSpring(entranceIds)}`);
    }
  }

  replaceEntranceSchedules(
    entranceScheduleList: EntranceSchedule[],
    entranceIds: (number | string)[]
  ): Promise<Response> | undefined {
    const cleanedEntranceScheduleList = entranceScheduleList.map(
      (schedule) => ({
        entranceScheduleName: schedule.entranceScheduleName,
        rrule: schedule.rrule,
        timeStart: schedule.timeStart,
        timeEnd: schedule.timeEnd,
      })
    );
    if (useApi) {
      return sendApi(`/api/entrance-schedule/replace?entranceids=${encodeArrayForSpring(entranceIds)}`,
        {
          method: "PUT",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(cleanedEntranceScheduleList),
        }
      );
    }
  }

  addEntranceSchedules(
    entranceScheduleList: EntranceSchedule[],
    entranceIds: (number | string)[]
  ): Promise<Response> | undefined {
    const cleanedEntranceScheduleList = entranceScheduleList.map(
      (schedule) => ({
        entranceScheduleName: schedule.entranceScheduleName,
        rrule: schedule.rrule,
        timeStart: schedule.timeStart,
        timeEnd: schedule.timeEnd,
      })
    );
    if (useApi) {
      return sendApi(`/api/entrance-schedule/add?entranceids=${encodeArrayForSpring(entranceIds)}`,
        {
          method: "PUT",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(cleanedEntranceScheduleList),
        }
      );
    }
  }

  deleteEntranceSchedule(entranceScheduleId: number | string): Promise<Response> | undefined {
    if (useApi) { return sendApi(`/api/entrance-schedule/delete/${entranceScheduleId}`, { method: "DELETE" }); }
  }

  getCurrentEntranceStatus(): Promise<Response> | undefined {
    if (useApi) { return sendApi("/api/entrance-schedule/current"); }
  }

  getCurrentEntranceStatusForOneEntrance(entranceId: number | string): Promise<Response> | undefined {
    if (useApi) { return sendApi(`/api/entrance-schedule/current/${entranceId}`); }
  }

  activateEntranceSchedule(scheduleId: number | string): Promise<Response> | undefined {
    if (useApi) { return sendApi(`/api/entrance-schedule/enable/${scheduleId}`, { method: "PUT" }); }
  }

  deactivateEntranceSchedule(scheduleId: number | string): Promise<Response> | undefined {
    if (useApi) { return sendApi(`/api/entrance-schedule/disable/${scheduleId}`, { method: "PUT" }); }
  }
}

export const entranceScheduleApi = new EntranceScheduleApi();
