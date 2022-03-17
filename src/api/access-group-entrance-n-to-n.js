import { fakeAccessGroupEntranceNtoN, useApi, fakeEntrances, fakeAccessGroups, sendApi } from './api-config';

// helper method placed outside so other files have no access to this
const assignmentHelper = (parentId, childrenIds, parentName, childName) => {
    // first remove all relationships to parent
    while (true) {
        const index = fakeAccessGroupEntranceNtoN.findIndex(
            groupEntrance => groupEntrance[parentName] == parentId
        )
        if (index == -1) { break; }
        fakeAccessGroupEntranceNtoN.splice(index, 1);
    }

    const length = fakeAccessGroupEntranceNtoN.length;

    const lastId = length > 0 ? fakeAccessGroupEntranceNtoN[length - 1].groupToEntranceId : 1;

    childrenIds.forEach(
        (childId, i) => {
            const toAdd = { groupToEntranceId: lastId + i };
            toAdd[parentName] = parentId;
            toAdd[childName] = childId;
            fakeAccessGroupEntranceNtoN.push(toAdd);
        }
    )
}

class AccessGroupEntranceNtoNApi {
    getEntranceWhereAccessGroupId(accessGroupId) {
        if(useApi) { return sendApi(`/api/access-group-entrance?accessgroupid=${encodeURIComponent(accessGroupId)}`); }
        return Promise.resolve(
            new Response(
                JSON.stringify(fakeAccessGroupEntranceNtoN
                    .filter(groupEntrance => groupEntrance.accessGroupId == accessGroupId)
                    .map(groupEntrance => {
                        return {
                            groupToEntranceId: groupEntrance.groupToEntranceId,
                            entrance: fakeEntrances.find(e => e.entranceId == groupEntrance.entranceId)
                        }
                    })),
                { status: 200 })       
            )
    }

    getAccessGroupWhereEntranceId(entranceId) {
        if(useApi) { return sendApi(`/api/access-group-entrance?entranceid=${encodeURIComponent(entranceId)}`); }
        return Promise.resolve(
            new Response(
                JSON.stringify(fakeAccessGroupEntranceNtoN
                    .filter(groupEntrance => groupEntrance.entranceId == entranceId)
                    .map(groupEntrance => {
                        return {
                            groupToEntranceId: groupEntrance.groupToEntranceId,
                            accessGroup: fakeAccessGroups.find(group => group.accessGroupId == groupEntrance.accessGroupId)
                        }
                    })),
                { status: 200 })
            )
    }

    assignAccessGroupToEntrance(entranceId, accessGroupIds) {
        if(useApi) { 
            const accessGroupIdsString = JSON.stringify(accessGroupIds);
            return sendApi(`/api/access-group-entrance/entrance/${entranceId}?accessgroupids=${encodeURIComponent(accessGroupIdsString.substring(1, accessGroupIdsString.length - 1))}`, { method: 'POST' }); 
        }
        assignmentHelper(entranceId, accessGroupIds, 'entranceId', 'accessGroupId');

        return Promise.resolve(new Response(null, { status: 204 }));
    }

    assignEntranceToAccessGroup(accessGroupId, entranceIds) {
        if(useApi) { 
            const entranceIdsString = JSON.stringify(entranceIds);
            return sendApi(`/api/access-group-entrance/access-group/${accessGroupId}?accessgroupids=${encodeURIComponent(entranceIdsString.substring(1, entranceIdsString.length - 1))}`, { method: 'POST' }); 
        }
        assignmentHelper(accessGroupId, entranceIds, 'accessGroupId', 'entranceId');

        return Promise.resolve(new Response(null, { status: 204 }))
    }
}

const accessGroupEntranceNtoNApi = new AccessGroupEntranceNtoNApi();
export default accessGroupEntranceNtoNApi;