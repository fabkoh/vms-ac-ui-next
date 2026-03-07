import { fakeVideoRecorders, useApi } from "./api-config";
import { sendApi } from "./api-helpers";
import type { VideoRecorder } from "../types/models";

class VideoRecorderApi {

  createVideoRecorder({
    recorderName,
    recorderSerialNumber,
    recorderPublicIp,
    recorderPrivateIp,
    recorderPortNumber,
    recorderIWSPort,
    recorderUsername,
    recorderPassword,
    autoPortForwarding,
  }: Omit<VideoRecorder, "recorderId" | "created" | "recorderChannels" | "recorderCameras" | "recorderIpAddress">): Promise<Response> | undefined {
    if (useApi) {
      return sendApi("/api/videorecorder", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          recorderName,
          recorderSerialNumber,
          recorderPublicIp,
          recorderPrivateIp,
          recorderPortNumber,
          recorderIWSPort,
          recorderUsername,
          recorderPassword,
          autoPortForwarding,
        }),
      });
    }
  }

  getRecorders(): Promise<Response> {
    if (useApi) { return sendApi("/api/videorecorders"); }

    return Promise.resolve(new Response(JSON.stringify(fakeVideoRecorders), { status: 200 }));
  }

  getRecorder(id: number | string): Promise<Response> | undefined {
    if (useApi) { return sendApi(`/api/videorecorder/${id}`); }
  }

  updateRecorder({
    recorderId,
    recorderName,
    recorderSerialNumber,
    recorderPublicIp,
    recorderPrivateIp,
    recorderPortNumber,
    recorderUsername,
    recorderPassword,
    recorderIWSPort,
    autoPortForwarding,
  }: Omit<VideoRecorder, "created" | "recorderChannels" | "recorderCameras" | "recorderIpAddress">): Promise<Response> | undefined {
    if (useApi) {
      return sendApi("/api/videorecorder", {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          recorderId,
          recorderName,
          recorderSerialNumber,
          recorderPublicIp,
          recorderPrivateIp,
          recorderPortNumber,
          recorderUsername,
          recorderPassword,
          recorderIWSPort,
          autoPortForwarding,
        }),
      });
    }
  }

  deleteRecorder(recorderId: number | string): Promise<Response> | undefined {
    if (useApi) {
      return sendApi(`/api/videorecorder/${recorderId}`, { method: "DELETE" });
    }
  }
}

const videoRecorderApi = new VideoRecorderApi();

export default videoRecorderApi;
