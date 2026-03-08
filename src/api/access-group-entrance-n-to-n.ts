import { fakeAccessGroupEntranceNtoN, useApi, fakeEntrances, fakeAccessGroups } from "./api-config";
import { encodeArrayForSpring, sendApi } from "./api-helpers";

// helper method placed outside so other files have no access to this
const assignmentHelper = (
  parentId: number | string,
  childrenIds: (number | string)[],
  parentName: string,
  childName: string
): void => {
  // first remove all relationships to parent
  while (true) {
    const index = fakeAccessGroupEntranceNtoN.findIndex(
      (groupEntrance: any) => groupEntrance[parentName] == parentId
    );
    if (index == -1) { break; }
    fakeAccessGroupEntranceNtoN.splice(index, 1);
  }

  const length = fakeAccessGroupEntranceNtoN.length;

  const lastId = length > 0 ? fakeAccessGroupEntranceNtoN[length - 1].groupToEntranceId : 1;

  childrenIds.forEach(
    (childId, i) => {
      const toAdd: any = { groupToEntranceId: lastId + i };
      toAdd[parentName] = parentId;
      toAdd[childName] = childId;
      fakeAccessGroupEntranceNtoN.push(toAdd);
    }
  );
};

class AccessGroupEntranceNtoNApi {
  getEntranceWhereAccessGroupId(accessGroupId: number | string): Promise<Response> {
    if (useApi) { return sendApi(`/api/access-group-entrance?accessgroupid=${encodeURIComponent(accessGroupId)}`); }
    return Promise.resolve(
      new Response(
        JSON.stringify((fakeAccessGroupEntranceNtoN as any[])
          .filter((groupEntrance) => groupEntrance.accessGroupId == accessGroupId)
          .map((groupEntrance) => {
            return {
              groupToEntranceId: groupEntrance.groupToEntranceId,
              entrance: fakeEntrances.find((e) => e.entranceId == groupEntrance.entranceId),
            };
          })),
        { status: 200 })
    );
  }

  getAccessGroupWhereEntranceId(entranceId: number | string): Promise<Response> {
    if (useApi) { return sendApi(`/api/access-group-entrance?entranceid=${encodeURIComponent(entranceId)}`); }
    return Promise.resolve(
      new Response(
        JSON.stringify((fakeAccessGroupEntranceNtoN as any[])
          .filter((groupEntrance) => groupEntrance.entranceId == entranceId)
          .map((groupEntrance) => {
            return {
              groupToEntranceId: groupEntrance.groupToEntranceId,
              accessGroup: fakeAccessGroups.find((group) => group.accessGroupId == groupEntrance.accessGroupId),
            };
          })),
        { status: 200 })
    );
  }

  getGroupToEntranceId(accessGroupId: number | string, entranceId: number | string): Promise<Response> {
    if (useApi) { return sendApi(`/api/access-group-entrance?accessGroupId=${encodeURIComponent(accessGroupId)},entranceid=${encodeURIComponent(entranceId)}`); }
    return Promise.resolve(
      new Response(
        JSON.stringify((fakeAccessGroupEntranceNtoN as any[])
          .filter((groupEntrance) => groupEntrance.entranceId == entranceId && groupEntrance.accessGroupId == accessGroupId)
          .map((groupEntrance) => {
            return {
              groupToEntranceId: groupEntrance.groupToEntranceId,
              accessGroup: fakeAccessGroups.find((group) => group.accessGroupId == groupEntrance.accessGroupId),
              isActive: groupEntrance.entrance && groupEntrance.entrance.isActive,
            };
          })),
        { status: 200 })
    );
  }

  assignAccessGroupsToEntrance(accessGroupIds: (number | string)[], entranceId: number | string): Promise<Response> {
    if (useApi) {
      const accessGroupIdsString = JSON.stringify(accessGroupIds);
      return sendApi(`/api/access-group-entrance/entrance/${entranceId}?accessgroupids=${encodeURIComponent(accessGroupIdsString.substring(1, accessGroupIdsString.length - 1))}`, { method: "POST" });
    }
    assignmentHelper(entranceId, accessGroupIds, "entranceId", "accessGroupId");

    return Promise.resolve(new Response(null, { status: 204 }));
  }

  assignEntrancesToAccessGroup(entranceIds: (number | string)[], accessGroupId: number | string): Promise<Response> {
    if (useApi) {
      return sendApi(`/api/access-group-entrance/access-group/${accessGroupId}?entranceids=${encodeArrayForSpring(entranceIds)}`, { method: "POST" });
    }
    assignmentHelper(accessGroupId, entranceIds, "accessGroupId", "entranceId");

    return Promise.resolve(new Response(null, { status: 204 }));
  }
}

const accessGroupEntranceNtoNApi = new AccessGroupEntranceNtoNApi();
export default accessGroupEntranceNtoNApi;
