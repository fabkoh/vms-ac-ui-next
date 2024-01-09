/**
 * Entrance util functions
 *
 * filterEntranceBy... takes in (entrance, query)
 * filterEntrancesBy... takes in (list of entrance, query)
 *
 * ...ByString filters entrances by name and description (query is string)
 * ...ByStatus filters entrances by isActive (query is null or boolean)
 *
 * filterEntranceByStringPlaceholder is meant to be the placeholder for a textfield where
 * users type in the query to filter entrances by (like in entrance list)
**/

import { isInteger } from "formik";
import { filterByState, isObject, stringIn } from "./utils";

// for textfield placeholder
const filterVideoByStringPlaceholder = "Search for name, serial number or IP address";

const stringFilterHelper = (recorder, query) => query === "" || stringIn(query, recorder.recorderName) || stringIn(query, recorder.recorderSerialNumber) || stringIn(query, recorder.recorderIpAddress);

// returns true if queryString === "" or
//                 lowercase queryString in lowercase recorderName or recorderSerialNumber
//                 lowercase queryString in recorderIpAddress
const filterRecorderByString = (recorder, queryString) => stringFilterHelper(recorder, queryString.toLowerCase());

// returns true if status == null or
//                 isActive == status
const filterRecorderByStatus = (recorder, status) => status == null || recorder.isActive == status;

const getVideoRecorderDetailsLink = (recorder) => isObject(recorder) && `/dashboard/video-recorders/details/${recorder}`;

const getVideoRecorderEditLink = (recorderId) => {
    console.warn("recorders ===>", recorderId)
    return `/dashboard/video-recorders/edit?ids=${encodeURIComponent(JSON.stringify([recorderId]))}` //'/dashboard/video-recorders/edit?ids=' + encodeURIComponent(JSON.stringify(recorders.filter(isObject).map(e => e.recorderId)))
};

const getVideoRecorderIdsEditLink = (ids) =>  '/dashboard/video-recorders/edit?ids=' + encodeURIComponent(JSON.stringify(ids));

const getVideoRecordersEditLink = (recorders) =>  
{   return `/dashboard/video-recorders/edit?ids=${encodeURIComponent(JSON.stringify(recorders))}`;}


const videoRecorderListLink = '/dashboard/video-recorders';
const videoRecorderCreateLink = '/dashboard/video-recorders/create';

const getVideoRecorderLabel = (recorder) => isObject(recorder) && recorder.recorderName;

const filterVideoRecordersByString = (recorders, queryString) => {
    const query = queryString.toLowerCase();
    return recorders.filter(e => stringFilterHelper(e, query))
}

const filterRecorderByState = filterByState(filterVideoRecordersByString);

const isRecorderEqual = (e1, e2) => isObject(e1) && isObject(e2) && e1.recorderId != null && e1.recorderId === e2.recorderId;

export { getVideoRecordersEditLink, filterVideoByStringPlaceholder, filterRecorderByString, filterRecorderByStatus, videoRecorderListLink, videoRecorderCreateLink, getVideoRecorderEditLink, getVideoRecorderIdsEditLink, getVideoRecorderDetailsLink, getVideoRecorderLabel, filterVideoRecordersByString, filterRecorderByState, isRecorderEqual }