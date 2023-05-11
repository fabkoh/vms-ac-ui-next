import { useApi } from './api-config';
import { sendApi } from './api-helpers';

class UserApi {

    registerUser({
        firstName,
        lastName,
        email,
        password,
        role,
        mobile
    }) {
        if (useApi) {
            return sendApi('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    password,
                    role,
                    mobile
                })
            });
        }
    }

}

export const userApi = new UserApi();