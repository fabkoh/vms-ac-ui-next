import {
  useApi,
  fakeInputEvents,
  fakeOutputEvents,
  fakeEventsManagement,
} from "./api-config";
import { encodeArrayForSpring, sendApi } from "./api-helpers";
import type { EventActionInput, EventActionOutput, TriggerSchedule, EventsManagement } from "../types/models";

class EventsManagementApi {
  createEventsManagement({
    eventsManagementName,
    inputEvents,
    outputActions,
    controllerIds,
    entranceIds,
    triggerSchedules,
  }: {
    eventsManagementName: string;
    inputEvents: EventActionInput[];
    outputActions: EventActionOutput[];
    controllerIds: number[];
    entranceIds: number[];
    triggerSchedules: TriggerSchedule[];
  }): Promise<Response> {
    if (useApi) {
      return sendApi("/api/eventsmanagement", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          eventsManagementName,
          inputEvents,
          outputActions,
          controllerIds,
          entranceIds,
          triggerSchedules,
        }),
      });
    }

    const newEventsManagementArr: unknown[] = [];
    if (controllerIds && controllerIds.length > 0) {
      for (let i = 0; i < controllerIds.length; i++) {
        const newEventManagement = {
          eventsManagementId:
            (fakeEventsManagement as EventsManagement[])
              .map((group) => group.eventsManagementId)
              .reduce((a, b) => Math.max(a, b), 0) + 1,
          eventsManagementName,
          inputEvents,
          outputActions,
          controllerId: controllerIds[i],
          entranceId: null,
          triggerSchedules,
        };
        fakeEventsManagement.push(newEventManagement);
        newEventsManagementArr.push(newEventManagement);
      }
    }
    if (entranceIds && entranceIds.length > 0) {
      for (let i = 0; i < entranceIds.length; i++) {
        const newEventManagement = {
          eventsManagementId:
            (fakeEventsManagement as EventsManagement[])
              .map((group) => group.eventsManagementId)
              .reduce((a, b) => Math.max(a, b), 0) + 1,
          eventsManagementName,
          inputEvents,
          outputActions,
          controllerId: null,
          entranceId: entranceIds[i],
          triggerSchedules,
        };
        fakeEventsManagement.push(newEventManagement);
        newEventsManagementArr.push(newEventManagement);
      }
    }

    return Promise.resolve(
      new Response(JSON.stringify(newEventsManagementArr), { status: 201 })
    );
  }

  replaceEventsManagement(
    eventsManagementList: EventsManagement[],
    entranceIds: number[],
    controllerIds: number[]
  ): Promise<Response> | undefined {
    if (useApi) {
      return sendApi(
        `/api/eventsmanagement/replace?entranceIds=${encodeArrayForSpring(
          entranceIds
        )}&controllerIds=${encodeArrayForSpring(controllerIds)}`,
        {
          method: "PUT",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(eventsManagementList),
        }
      );
    }
  }

  addEventsManagement(
    eventsManagementList: EventsManagement[],
    entranceIds: number[],
    controllerIds: number[]
  ): Promise<Response> | undefined {
    if (useApi) {
      return sendApi(
        `/api/eventsmanagement/add?entranceIds=${encodeArrayForSpring(
          entranceIds
        )}&controllerIds=${encodeArrayForSpring(controllerIds)}`,
        {
          method: "PUT",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(eventsManagementList),
        }
      );
    }
  }

  getEventsManagementNotifications(eventsManagementId: number | string): Promise<Response> | undefined {
    if (useApi) {
      return sendApi(
        "api/eventsmanagement/notifications/" + eventsManagementId
      );
    }
  }

  getAllEventsManagementNotifications(): Promise<Response> | undefined {
    if (useApi) {
      return sendApi("api/eventsmanagement/notifications");
    }
  }

  getAllEventsManagement(): Promise<Response> {
    if (useApi) {
      return sendApi("/api/eventsmanagement");
    }
    return Promise.resolve(
      new Response(JSON.stringify([]), { status: 200 })
    );
  }

  getEntranceEventsManagement(entranceId: number | string): Promise<Response> {
    if (useApi) {
      return sendApi(`/api/eventsmanagement/entrance/${entranceId}`);
    }
    return Promise.resolve(
      new Response(JSON.stringify([]), { status: 200 })
    );
  }

  getControllerEventsManagement(controllerId: number | string): Promise<Response> {
    if (useApi) {
      return sendApi(`/api/eventsmanagement/controller/${controllerId}`);
    }
    return Promise.resolve(
      new Response(JSON.stringify([]), { status: 200 })
    );
  }

  deleteEventsManagement(id: number | string): Promise<Response> | undefined {
    if (useApi) {
      return sendApi(`/api/eventsmanagement/${id}`, { method: "DELETE" });
    }
  }

  getInputEvents(forController: boolean): Promise<Response> {
    if (useApi) {
      return sendApi(`/api/event/input/types?forController=${forController}`);
    }
    return Promise.resolve(
      new Response(JSON.stringify(fakeInputEvents), { status: 200 })
    );
  }

  getOutputEvents(forController: boolean): Promise<Response> {
    if (useApi) {
      return sendApi(`/api/event/output/types?forController=${forController}`);
    }
    return Promise.resolve(
      new Response(JSON.stringify(fakeOutputEvents), { status: 200 })
    );
  }

  getIndividualEventsManagement(emId: number | string): Promise<Response> {
    if (useApi) {
      return sendApi(`/api/eventsmanagement/${emId}`);
    }
    console.log("apitest");
    return Promise.resolve(
      new Response(JSON.stringify({}), { status: 200 })
    );
  }

  getForController(controllerId: number | string): Promise<Response> {
    return sendApi(`/api/controller/${controllerId}/eventsmanagement`, {
      method: "GET",
    });
  }

  deleteById(emId: number | string): Promise<Response> {
    return sendApi(`/api/eventsmanagement/${emId}`, { method: "DELETE" });
  }

  editEventsManagement(
    emId: number | string,
    eventsManagementList: EventsManagement[],
    entranceIds: number[],
    controllerIds: number[]
  ): void {
    Promise.resolve(this.deleteById(emId)).then(
      () => this.addEventsManagement(eventsManagementList, entranceIds, controllerIds)
    );
  }
}

export const eventsManagementApi = new EventsManagementApi();
