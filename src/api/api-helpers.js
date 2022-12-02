import { apiUri } from './api-config'

export function encodeArrayForSpring(array) {
    const arrString = JSON.stringify(array);
    return encodeURIComponent(arrString.substring(1, arrString.length - 1));
}

export const serverDownCode = 599;

export function sendApi(path, init={}) {
    const token = localStorage.getItem("accessToken");
    const auth = token ? { "Authorization": `Bearer ${token}`,"Content-Type": "application/json" } : {};
    init["headers"] = auth;
    console.log(init);
    return fetch(apiUri + path, init)
        .catch((error) => {
            console.error('Error:', error);
            console.log("server is down!!");
            return Promise.resolve(new Response({}, { status: serverDownCode }));
    });;
}