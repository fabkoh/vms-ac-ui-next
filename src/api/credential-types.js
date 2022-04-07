import { useApi } from './api-config';
import { sendApi } from './api-helpers';

const getCredTypesApi = () => {
    if (useApi) {
        return sendApi('/api/credential-types');
    }
    return Promise.resolve(new Response([], { status: 200 }));
};

export { getCredTypesApi };