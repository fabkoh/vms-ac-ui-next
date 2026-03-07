import toast from "react-hot-toast";
import {
  useApi,
  fakeAccessGroups,
  fakePersons,
  fakeAccessGroupSchedule,
  fakeControllers,
  fakeAuthDevices,
} from "./api-config";
import { encodeArrayForSpring, sendApi } from "./api-helpers";

class ControllerApi {
  getControllers(): Promise<Response> {
    if (useApi) {
      return sendApi(`/api/controllers`);
    }
    const controllers = fakeControllers.map((controller) => {
      return { ...controller };
    });
    controllers.forEach((controller: any) => {
      // populate authDevice
      controller.authDevice = fakeAuthDevices.filter(
        (device) => device.controllerId == controller.controllerId
      );

      return controller;
    });
    return Promise.resolve(
      new Response(JSON.stringify(controllers), { status: 200 })
    );
  }

  getController(controllerId: number | string): Promise<Response> {
    if (useApi) {
      return sendApi(`/api/controller/${controllerId}`);
    }
    const controller: any = fakeControllers.find(
      (c) => c.controllerId == controllerId
    );

    if (controller) {
      controller.authDevices = fakeAuthDevices.filter(
        (d) => d.controllerId == controllerId
      );
      return Promise.resolve(
        new Response(JSON.stringify(controller), { status: 200 })
      );
    }

    return Promise.resolve(
      new Response(
        JSON.stringify({
          personId: `controller with Id ${controllerId} does not exist`,
        }),
        { status: 404 }
      )
    );
  }

  updateController({
    controllerId,
    controllerIP,
    controllerName,
    controllerIPStatic,
    controllerMAC,
    controllerSerialNo,
  }: {
    controllerId: number | string;
    controllerIP: string;
    controllerName: string;
    controllerIPStatic: boolean;
    controllerMAC: string;
    controllerSerialNo: string;
  }): Promise<Response> | undefined {
    if (useApi) {
      return sendApi(`/api/controller/${controllerId}`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          controllerId,
          controllerIP,
          controllerName,
          controllerIPStatic,
          controllerMAC,
          controllerSerialNo,
        }),
      });
    }
  }

  deleteController(controllerId: number | string): Promise<Response> | undefined {
    if (useApi) {
      return sendApi(`/api/controller/delete/${controllerId}`, {
        method: "DELETE",
      });
    }
  }

  getAuthStatus(controllerId: number | string): Promise<Response> | undefined {
    if (useApi) {
      return sendApi(`/api/controllerConnection/${controllerId}`);
    }
  }

  resetController(controllerId: number | string): Promise<Response> | undefined {
    if (useApi) {
      return sendApi(`/api/controller/reset/${controllerId}`, {
        method: "PUT",
      });
    }
  }

  uniconUpdater(): Promise<Response> | undefined {
    if (useApi) {
      return sendApi(`/api/uniconUpdater`, { method: "POST" });
    }
  }

  getAllCurrentAuthMethod(controllerId: number | string): Promise<Response> | undefined {
    if (useApi) {
      return sendApi(`/api/controller/currentAuthMethod/${controllerId}`);
    }
  }

  getPiProperty(controllerId: number | string): Promise<Response> | undefined {
    if (useApi) {
      return sendApi(`/api/controller/piProperty/${controllerId}`);
    }
  }
}

export const controllerApi = new ControllerApi();
