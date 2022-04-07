import { isObject } from "./utils";

const getCredTypeName = (credType) => isObject(credType) && credType.credTypeName;

const getCredTypeId = (credType) => isObject(credType) && credType.credTypeId;

export { getCredTypeId, getCredTypeName };