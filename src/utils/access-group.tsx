/**
 * Access Group util functions
 *
 * filterAccessGroupBy... takes in (access group, query)
 * filterAccessGroupsBy... takes in (list of access group, query)
 *
 * ...ByString filters access groups by name and description (query is string)
 *
 * filterAccessGroupByStringPlaceholder is meant to be the placeholder for a textfield where
 * users type in the query to filter entrances by (like in entrance list)
**/

import { filterByState, isObject, stringIn } from "./utils";

// for textfield placeholder
const filterAccessGroupByStringPlaceholder = "Search for access group name or description";

// returns true if queryString === "" or
//                 lowercase queryString in lowercase accessGroupName or
//                 lowercase queryString in lowercase accessGroupDesc
const filterAccessGroupByString = (accessGroup, queryString) => {
    const query = queryString.toLowerCase();
    return (
        query === "" ||
        stringIn(query, accessGroup.accessGroupName) ||
        stringIn(query, accessGroup.accessGroupDesc)
    );
};

const filterAccessGroupsByString = (accessGroups, queryString) => accessGroups.filter(group => filterAccessGroupByString(group, queryString));

const filterAccessGroupsByState = filterByState(filterAccessGroupsByString);

const getAccessGroupLabel = accessGroup => accessGroup.accessGroupName;

const getAccessGroupDetailsLink = accessGroup => `/dashboard/access-groups/details/${accessGroup.accessGroupId}`;

const isAccessGroupEqual = (group1, group2) => isObject(group1) && isObject(group2) && group1.accessGroupId && group1.accessGroupId == group2.accessGroupId

const accessGroupListLink = '/dashboard/access-groups';

const accessGroupCreateLink = '/dashboard/access-groups/create';

const getAccessGroupEditLink = (accessGroup) => isObject(accessGroup) && ('/dashboard/access-groups/edit?ids=' + encodeURIComponent(JSON.stringify([accessGroup.accessGroupId])))

export { filterAccessGroupByStringPlaceholder, filterAccessGroupByString, filterAccessGroupsByString, getAccessGroupLabel, getAccessGroupDetailsLink, isAccessGroupEqual, filterAccessGroupsByState, accessGroupListLink, accessGroupCreateLink, getAccessGroupEditLink };