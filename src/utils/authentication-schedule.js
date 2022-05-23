import { isObject } from "./utils";

const getAuthenticationScheduleEditLink = (authDeviceId) => '/dashboard/authentication-schedule/modify/' + authDeviceId;

export { getAuthenticationScheduleEditLink }