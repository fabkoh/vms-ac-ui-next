import { fakeVideoRecorders, useApi, fakeAccessGroups } from './api-config';
import { sendApi } from './api-helpers';

class VideoRecorderApi {

    createVideoRecorder({
        recorderName,
        recorderSerialNumber,
        recorderPublicIp,
        recorderPrivateIp,
        recorderPortNumber,
        recorderIWSPort,
        recorderUsername,
        recorderPassword
    }) {
        if (useApi) {
            return sendApi("/api/videorecorder", {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    recorderName,
                    recorderSerialNumber,
                    recorderPublicIp,
                    recorderPrivateIp,
                    recorderPortNumber,
                    recorderIWSPort,
                    recorderUsername,
                    recorderPassword
                })
            })
        }

        // const newRecorder = {
        //     recorderId: fakeVideoRecorders.map(group => group.recorderId)
        //                                    .reduce((a, b) => Math.max(a, b), 0) + 1,
        //     recorderName,
        //     recorderSerialNumber,
        //     recorderIpAddress,
        //     recorderPortNumber,
        //     recorderIWSPort,
        //     recorderUsername,
        //     recorderPassword
        // }

        // fakeVideoRecorders.push(newRecorder);

        // return Promise.resolve(new Response(JSON.stringify(newRecorder), { status: 201 }));
    }

    getRecorders() {
        if (useApi) { return sendApi('/api/videorecorders'); }

        return Promise.resolve(new Response(JSON.stringify(fakeVideoRecorders), { status: 200 }));
    }

    getRecorder(id) {
        if (useApi) { return sendApi(`/api/videorecorder/${id}`); }

        // const recorder = { ...fakeVideoRecorders.find(recorder => recorder.recorderId == id) };

        // if (recorder) {
        //     return Promise.resolve(new Response(JSON.stringify(recorder), { status: 200 }));
        // }

        // return Promise.resolve(new Response(null, { status: 404 }));
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
        recorderIWSPort
    }) {
        if (useApi) {
            return sendApi("/api/videorecorder", {
                method: 'PUT',
                headers: {
                    'Content-type': 'application/json'
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
                    recorderIWSPort
                })
            });
        }
    }

    deleteRecorder(recorderId){
        if(useApi){
            return sendApi(`/api/videorecorder/${recorderId}`,{method: 'DELETE'})
        }
    }
}

const videoRecorderApi = new VideoRecorderApi();

export default videoRecorderApi;

