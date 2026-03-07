import { fakeEntrances, useApi, fakeAccessGroups } from "./api-config";
import { sendApi } from "./api-helpers";
import type { AccessGroup } from "../types/models";

class EntranceApi {

  createEntrance({
    entranceName,
    entranceDesc,
    accessGroups,
    thirdPartyOption,
  }: {
    entranceName: string;
    entranceDesc?: string;
    accessGroups: AccessGroup[];
    thirdPartyOption?: string | null;
  }): Promise<Response> {
    if (useApi) {
      return sendApi("/api/entrance", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          entranceName,
          entranceDesc,
          accessGroups,
          thirdPartyOption,
        }),
      });
    }

    const newEntrance = {
      entranceId: fakeEntrances.map((group) => group.entranceId)
        .reduce((a, b) => Math.max(a, b), 0) + 1,
      entranceName,
      entranceDesc,
      thirdPartyOption,
    };

    fakeEntrances.push(newEntrance as any);

    const accessGroupIds = accessGroups.map((p) => p.accessGroupId);
    const entranceId = newEntrance.entranceId;
    fakeAccessGroups.forEach((p: any) => {
      if (accessGroupIds.includes(p.entranceId)) {
        p.entrance = entranceId;
      }
    });

    // did not populate person field here as not required
    return Promise.resolve(new Response(JSON.stringify(newEntrance), { status: 201 }));
  }

  getEntrances(): Promise<Response> {
    if (useApi) { return sendApi("/api/entrances"); }

    return Promise.resolve(new Response(JSON.stringify(fakeEntrances), { status: 200 }));
  }

  getEntrance(id: number | string): Promise<Response> {
    if (useApi) { return sendApi(`/api/entrance/${id}`); }

    const entrance: any = { ...fakeEntrances.find((entrance) => entrance.entranceId == id) };

    if (entrance) {
      const entranceId = entrance.entranceId;
      entrance.accessGroups = fakeAccessGroups.filter((p: any) => p.entrance == entranceId);

      return Promise.resolve(new Response(JSON.stringify(entrance), { status: 200 }));
    }

    return Promise.resolve(new Response(null, { status: 404 }));
  }

  updateEntrance({
    entranceId,
    entranceName,
    entranceDesc,
    used,
    accessGroups,
    thirdPartyOption,
  }: {
    entranceId: number;
    entranceName: string;
    entranceDesc?: string;
    used?: boolean;
    accessGroups: AccessGroup[];
    thirdPartyOption?: string | null;
  }): Promise<Response> {
    if (useApi) {
      return sendApi("/api/entrance", {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          entranceId,
          entranceName,
          entranceDesc,
          used,
          accessGroups,
          thirdPartyOption,
        }),
      });
    }
    const updatedEntrance = { entranceId, entranceName, entranceDesc, thirdPartyOption };
    const index = fakeEntrances.findIndex((e) => e.entranceId == entranceId);

    if (index == -1) {
      // no error message as not needed
      return Promise.resolve(new Response(null, { status: 404 }));
    }

    fakeEntrances[index] = updatedEntrance as any;

    const accessGroupIds = accessGroups.map((grp) => grp.accessGroupId);
    // update membership
    fakeAccessGroups.forEach((p: any) => {
      if (accessGroupIds.includes(p.accessGroupId)) {
        p.entrance = entranceId;
      } else if (p.entrance == entranceId) {
        p.entrance = null;
      }
    });

    // did not populate person field as not needed
    return Promise.resolve(new Response(JSON.stringify(updatedEntrance), { status: 200 }));
  }

  updateEntranceActiveStatus(entranceId: number | string, isActive: boolean): Promise<Response> {
    if (useApi) {
      if (isActive) {
        return sendApi(`/api/entrance/enable/${entranceId}`, { method: "PUT" });
      } else {
        return sendApi(`/api/entrance/disable/${entranceId}`, { method: "PUT" });
      }
    }

    (fakeEntrances.find((entrance) => entrance.entranceId == entranceId) as any).isActive = isActive;

    return Promise.resolve(new Response(String(isActive), { status: 200 }));
  }

  manuallyUnlockEntrance(entranceId: number | string): Promise<Response> {
    if (useApi) {
      return sendApi(`/api/entrance/unlock/${entranceId}`, { method: "GET" });
    }
    // When not using api, unlock will always succeed
    return Promise.resolve(new Response(null, { status: 200 }));
  }

  deleteEntrance(entranceId: number | string): Promise<Response> | undefined {
    if (useApi) {
      return sendApi(`/api/entrance/${entranceId}`, { method: "DELETE" });
    }
  }
}

const entranceApi = new EntranceApi();

export default entranceApi;
