import { fakeSMSConfig, fakeEmailConfig, useApi } from './api-config';
import { sendApi } from './api-helpers';

class NotificationsConfigApi {

    getNotificationSMSConfig() {
        if (useApi) { return sendApi('/api/notification/sms'); }

        return Promise.resolve(new Response(JSON.stringify(fakeSMSConfig), { status: 200 }));
    }

    getNotificationEmailConfig() {
        if (useApi) { return sendApi('/api/notification/email'); }

        return Promise.resolve(new Response(JSON.stringify(fakeEmailConfig), { status: 200 }));
    }

    changeSMSNotificationEnablementStatus() {
        // if disabled, it will enable, if enabled it will disable
        if (useApi) { return sendApi('/api/notification/sms/enablement', {method: 'POST'}); }

        return Promise.resolve({ status: 200 });
    }
    
    changeEmailNotificationEnablementStatus() {
        // if disabled, it will enable, if enabled it will disable
        if (useApi) { return sendApi('/api/notification/email/enablement', {method: 'POST'}); }

        return Promise.resolve({ status: 200 });
    }
}

const notificationConfigApi = new NotificationsConfigApi();

export default notificationConfigApi;

