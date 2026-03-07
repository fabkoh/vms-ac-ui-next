import { isObject } from "./utils";

const getAuthenticationScheduleEditLink = (controllerId,authDeviceId) => '/dashboard/authentication-schedule/modify/'+controllerId+"/" + authDeviceId;

export { getAuthenticationScheduleEditLink }