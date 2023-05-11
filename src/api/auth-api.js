// var api = "http://localhost:8082";
// const createAuthRequest = async (path, data) => {
//     try {
//         const token = localStorage.getItem("accessToken");
//         const auth = token ? { "Authorization": `Bearer ${token}` } : {};
//         console.log({body: JSON.stringify(data)});
//         const response = await fetch(`${api}/${path}`, {
//                 method: "POST",  
//                 headers: {
//                     "Content-Type": "application/json",
//                     ...auth
//                 },
//                 body: JSON.stringify(data)
//             });
//     return { response: await response.json(), type: response.ok ? "success" : "error"};
//     } catch (error) {
//         return { response: error, type: "error" };
//     }
//   };

//   const createGetRequest = async (path) => {
//     try {
//         const token = localStorage.getItem("accessToken");
//         const response = await fetch(`${api}/${path}`, {
//                 method: "GET",  
//                 headers: {
//                     Authorization: `Bearer ${token}`                    
//                 }
//             })
        
//         return { response: await response.json(), type: response.ok ? "success" : "error"};
//     } catch (error) {
//         return { response: error, type: "error" };
//     }
//   };

import { sendApi } from "./api-helpers";

const sendApiHelper = async(path,init={}) =>{
    const response = await sendApi(path,init);
    try{
        return { response: await response.json(), type: response.ok ? "success" : "error"};
    }
    catch{
        console.log(response, 55)
        return response
    }
}

export const authLogin = async( {email, password}) => {
    // const res = await createAuthRequest("api/auth/signin", { email, password });
    const res = await sendApiHelper("/api/auth/signin", {
                                   method: 'POST',
                                   body: JSON.stringify({email, password})
                               })
        if(res.type === "success") { 
            localStorage.setItem("accessToken", res.response.accessToken)
            localStorage.setItem("refreshToken", res.response.refreshToken);
        }
        return res;
} 

export const authRenewToken = async() => {
    const res = await sendApiHelper("/api/auth/refreshtoken", {
        method: "POST",  
        refreshToken: localStorage.getItem("refreshToken") });
    
    if(res.type === "success") { localStorage.setItem("accessToken", res.response.accessToken); }
}


export const authLogOut = async() => {
    const res = await sendApiHelper("/api/auth/signout",{
        method: "POST"});
    if(res.type === "success") { localStorage.removeItem("accessToken"); }
}

export const authSignUp = async (data) => {
    const res = await sendApiHelper("/api/auth/signup", {
        method: "POST",  
        body: JSON.stringify(data)
    });
    return res;
}

export const authEditProfile = async (data) => {
    const res = await sendApiHelper("/api/auth/edit", {
        method: "PUT",  
        body: JSON.stringify(data)
    });
    return res;
}

export const authGetProfile = async () => {
    const res = sendApiHelper("/api/auth/profile");
    return res;
}

export const authGetAccounts = async () => {
    const res = sendApiHelper("/api/auth/accounts");
    return res;
}

export const authDeleteUserAdmin = async (id) => {
    const res = await sendApiHelper(`/api/auth/deleteUserAdmin/${id}`, {
        method: "DELETE",  
    });
    return res;
}

export const authDeleteTechAdmin = async (id) => {
    const res = await sendApiHelper(`/api/auth/deleteTechAdmin/${id}`, {
        method: "DELETE",  
    });    
    return res;
}