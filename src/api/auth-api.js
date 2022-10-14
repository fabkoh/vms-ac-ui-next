var api = "http://localhost:8082";
const createAuthRequest = async (path, data) => {
    try {
        const token = localStorage.getItem("accessToken");
        const auth = token ? { "Authorization": `bearer ${token}` } : {};
        const response = await (
            await fetch(`${api}/${path}`, {
                method: "POST",  
                headers: {
                    "Content-Type": "application/json",
                    ...auth
                },
                body: JSON.stringify(data)
            })
        ).json();
        return { response: response, type: "success" };
    } catch (error) {
        return { response: error?.message, type: "error" };
    }
  };

export const authLogin = async({ email, password}) => {
    const res = await createAuthRequest("api/auth/signin", { email, password });
    if(res.type === "success") { 
        localStorage.setItem("accessToken", res.response.accessToken)
        sessionStorage.setItem("refreshToken", res.response.refreshToken);
    }
    return res;
} 

export const authRenewToken = async() => {
    const res = await createAuthRequest("api/auth/refreshtoken", { refreshToken: sessionStorage.getItem("refreshToken") });
    if(res.type === "success") { localStorage.removeItem("accessToken"); }
}


export const authLogOut = async() => {
    const res = await createPostRequest("api/auth/signout");
    if(res.type === "success") { localStorage.removeItem("accessToken"); }
}