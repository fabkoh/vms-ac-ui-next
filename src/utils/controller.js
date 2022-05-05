import { DEFAULT_URL, isObject, stringIn } from "./utils";

const getControllerDetailsLink = (controller) => {
    if (isObject(controller) && 'controllerId' in controller) {
        return `/dashboard/controllers/details/${controller.controllerId}`;
    }
    return DEFAULT_URL;
};

const getControllerEditLink = (controller) => {
    if (isObject(controller) && 'controllerId' in controller) {
        return `/dashboard/controllers/edit/${controller.controllerId}`;
    }
    return DEFAULT_URL;
}
const getControllerListLink = () => {
        return `/dashboard/controllers/`;
}
const getAuthdeviceDetailsLink = (controllerId,authDeviceId) => {
        return `/dashboard/controllers/auth-device/details/${controllerId}/${authDeviceId}`;
}
const getAuthdeviceEditLink = (controllerId,authDeviceId) => {
        return `/dashboard/controllers/auth-device/edit/${controllerId}/${authDeviceId}`;
}


const stringFilterHelper = (controller, query) => query === "" || stringIn(query, controller.controllerName) || stringIn(query, controller.controllerIP) || stringIn(query, controller.authDevices[0].entrance?.entranceName) || stringIn(query, controller.authDevices[2].entrance?.entranceName);

const filterControllerByString = (controller, queryString) => stringFilterHelper(controller, queryString.toLowerCase());

const filterControllerByStringPlaceholder = "Search for controller name, ip address or entrance name";

export { getControllerDetailsLink, filterControllerByString, filterControllerByStringPlaceholder, getControllerEditLink, getControllerListLink,getAuthdeviceDetailsLink,getAuthdeviceEditLink };