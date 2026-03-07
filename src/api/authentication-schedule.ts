import { useApi } from "./api-config";
import { encodeArrayForSpring, sendApi } from "./api-helpers";
import type { AuthMethodSchedule } from "../types/models";

class AuthMethodScheduleApi {

  replaceAuthDeviceSchedules(
    authMethodScheduleList: AuthMethodSchedule[],
    authDeviceIds: (string | number)[]
  ): Promise<Response> | undefined {
    const cleanedauthMethodScheduleList = authMethodScheduleList.map(
      (schedule) => ({
        authMethodScheduleName: schedule.authMethodScheduleName,
        rrule: schedule.rrule,
        timeStart: schedule.timeStart,
        timeEnd: schedule.timeEnd,
        authMethod: { authMethodId: schedule.authMethod },
      })
    );
    if (useApi) {
      return sendApi(`/api/authentication-schedule/replace?authDeviceIds=${encodeArrayForSpring(authDeviceIds)}`,
        {
          method: "PUT",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(cleanedauthMethodScheduleList),
        }
      );
    }
  }

  addAuthDeviceSchedules(
    authMethodScheduleList: AuthMethodSchedule[],
    authDeviceIds: (string | number)[]
  ): Promise<Response> | undefined {
    const cleanedauthMethodScheduleList = authMethodScheduleList.map(
      (schedule) => ({
        authMethodScheduleName: schedule.authMethodScheduleName,
        rrule: schedule.rrule,
        timeStart: schedule.timeStart,
        timeEnd: schedule.timeEnd,
        authMethod: { authMethodId: schedule.authMethod },
      })
    );
    if (useApi) {
      return sendApi(`/api/authentication-schedule/add?authDeviceIds=${encodeArrayForSpring(authDeviceIds)}`,
        {
          method: "PUT",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(cleanedauthMethodScheduleList),
        }
      );
    }
  }

  deleteAuthDeviceSchedule(authMethodScheduleId: number | string): Promise<Response> | undefined {
    if (useApi) { return sendApi(`/api/authentication-schedule/${authMethodScheduleId}`, { method: "DELETE" }); }
  }

  activateAuthDeviceSchedule(scheduleId: number | string): Promise<Response> | undefined {
    if (useApi) { return sendApi(`/api/authentication-schedule/enable/${scheduleId}`, { method: "PUT" }); }
  }

  deactivateAuthDeviceSchedule(scheduleId: number | string): Promise<Response> | undefined {
    if (useApi) { return sendApi(`/api/authentication-schedule/disable/${scheduleId}`, { method: "PUT" }); }
  }
}

export const authMethodScheduleApi = new AuthMethodScheduleApi();
