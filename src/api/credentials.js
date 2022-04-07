import { useApi } from './api-config';
import { sendApi } from './api-helpers';

const getCredentialsApi = () => {
    if (useApi) { return sendApi('/api/credentials'); }
}

const saveCredentialApi = (
    {
        credId,
        credUid,
        credTTL,
        isValid,
        isPerm,
        credTypeId

    }, personId, newCred) => {
        if(credTTL == null) {
            credTTL = new Date();
        }
        if (useApi) {
            if (newCred) {
                return sendApi('/api/credential', {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        credUid,
                        credTTL,
                        isValid,
                        isPerm,
                        personId,
                        credTypeId
                    })
                });
            } 
            return sendApi('/api/credential', {
                method: 'PUT',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    credId,
                    credUid,
                    credTTL,
                    isValid,
                    isPerm,
                    credTypeId
                })
            });
        }
    }

export { getCredentialsApi, saveCredentialApi }