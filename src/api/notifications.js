import { useApi } from './api-config';
import { sendApi } from './api-helpers';

class NotificationsApi {
    backToDefault() { //for back to default
        if (useApi) { return sendApi(`/api/notification/email/backToDefault`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            }
        });
    }}

    changeSMSEnablement(enabled) {
        if (useApi) {
            return sendApi('/api/notification/sms/enablement', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    enabled
                })
            });
    }}

    changeEmailEnablement(enabled) {
        if (useApi) {
            return sendApi('/api/notification/email/enablement', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    enabled
                })
            });
    }}


    getSMSSettings() {
        if (useApi) { return sendApi('/api/notification/sms'); }
    }

    getEmailSettings() {
        if (useApi) { return sendApi(`/api/notification/email`); }
    }

    updateEmail({
        emailSettingsId,
        username,
        email,
        emailPassword,
        hostAddress,
        portNumber,
        enabled
    }) {
        if (useApi) {
            return sendApi('/api/notification/email', {
                method: 'PUT',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    emailSettingsId,
                    username,
                    email,
                    emailPassword,
                    hostAddress,
                    portNumber,
                    enabled
                })
            });
        }
    }

    

}

export const notificationsApi = new NotificationsApi();