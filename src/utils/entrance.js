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

import { filterByState, isObject, stringIn } from "./utils";

// for textfield placeholder
const filterEntranceByStringPlaceholder = "Search for entrance name or description";

const stringFilterHelper = (entrance, query) => query === "" || stringIn(query, entrance.entranceName) || stringIn(query, entrance.entranceDesc);

// returns true if queryString === "" or
//                 lowercase queryString in lowercase entranceName or
//                 lowercase queryString in lowercase entranceDesc
const filterEntranceByString = (entrance, queryString) => stringFilterHelper(entrance, queryString.toLowerCase());

// returns true if status == null or
//                 isActive == status
const filterEntranceByStatus = (entrance, status) => status == null || entrance.isActive == status;

const getEntranceDetailsLink = (entrance) => isObject(entrance) && `/dashboard/entrances/details/${entrance.entranceId}`;

const getEntranceEditLink = (entrances) => (
    '/dashboard/entrances/edit?ids=' + encodeURIComponent(JSON.stringify(entrances.filter(isObject).map(e => e.entranceId)))
);

const getEntranceIdsEditLink = (ids) =>  '/dashboard/entrances/edit?ids=' + encodeURIComponent(JSON.stringify(ids));


const entranceListLink = '/dashboard/entrances';
const entranceCreateLink = '/dashboard/entrances/create';

const getEntranceLabel = (entrance) => isObject(entrance) && entrance.entranceName;

const filterEntrancesByString = (entrances, queryString) => {
    const query = queryString.toLowerCase();
    return entrances.filter(e => stringFilterHelper(e, query))
}

const filterEntrancesByState = filterByState(filterEntrancesByString);

const isEntranceEqual = (e1, e2) => isObject(e1) && isObject(e2) && e1.entranceId != null && e1.entranceId === e2.entranceId;

export { filterEntranceByStringPlaceholder, filterEntranceByString, filterEntranceByStatus, entranceListLink, entranceCreateLink, getEntranceEditLink, getEntranceIdsEditLink, getEntranceDetailsLink, getEntranceLabel, filterEntrancesByString, filterEntrancesByState, isEntranceEqual }