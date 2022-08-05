import { apiUri } from './api-config'

export function encodeArrayForSpring(array) {
    const arrString = JSON.stringify(array);
    return encodeURIComponent(arrString.substring(1, arrString.length - 1));
}

export function sendApi(path, init={}) {
    return fetch(apiUri + path, init)
        .catch((error) => {
            console.error('Error:', error);
            console.log("server is down!!");
            return Promise.resolve(new Response({}, { status: 599 }));
    });;
}