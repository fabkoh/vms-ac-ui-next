import { apiUri } from './api-config'

export function encodeArrayForSpring(array) {
    const arrString = JSON.stringify(array);
    return encodeURIComponent(arrString.substring(1, arrString.length - 1));
}

export const serverDownCode = 599;

export function sendApi(path, init={}) {
    console.log("token before",localStorage.getItem("accessToken"));
    authRenewToken();
    console.log("token after", localStorage.getItem("accessToken"));
    const token = localStorage.getItem("accessToken");
    const auth = token ? { "Authorization": `Bearer ${token}`,"Content-Type": "application/json" } : 
                {"Content-Type": "application/json"};
    init["headers"] = auth;
    //console.log(init);
    const promise = fetch(apiUri + path, init)
        .catch((error) => {
            console.error('Error:', error);
            console.log("server is down!!");
            return Promise.resolve(new Response({}, { status: serverDownCode }));
    });;
    return promise;
}

const authRenewToken = async() => {
    const res = await fetch(apiUri+"/api/auth/refreshtoken", {
        method: 'POST',  
        headers:{"Content-Type": "application/json"},
        body:JSON.stringify({"refreshToken": sessionStorage.getItem("refreshToken") })});
    const token = await res.json();
    if(res.type === "success") { localStorage.setItem("accessToken", token["accessToken"]); }
}