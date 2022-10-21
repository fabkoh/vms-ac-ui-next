import { fakeNotifLogs, useApi } from './api-config';
import { sendApi } from './api-helpers';

class NotificationsLogsApi {

    getNotifsCount() {
        if (useApi) { return sendApi(`/api/notification/logs/count`); }
        return Promise.resolve(new Response(JSON.stringify(20), { status: 200 }));
    }

    getNotifLogs(batchNo) {
        if (useApi) { return sendApi(`/api/notification/logs/all?batchNo=${batchNo}`); }
        return Promise.resolve(new Response(JSON.stringify(fakeNotifLogs), { status: 200 }));
    }

    searchNotifLogs(batchNo, queryString, start, end) {
        if (useApi) { return sendApi(`/api/notification/logs/all?batchNo=${batchNo}&queryString=${queryString}` + (start ? `&start=${start}` : ``) + (end ? `&end=${end}` : ``))}
        return Promise.resolve(new Response(JSON.stringify(fakeNotifLogs), { status: 200 }));
    }
}

export const notificationLogsApi = new NotificationsLogsApi();