import { apiUri } from "./api-config";

export function encodeArrayForSpring(array) {
  const arrString = JSON.stringify(array);
  return encodeURIComponent(arrString.substring(1, arrString.length - 1));
}

export const serverDownCode = 599;

export function sendApi(path, init = {}, refresh = true, contentType = "application/json") {

  function helper(contentType) {
    let token = localStorage.getItem("accessToken");
    var auth = {};
    if (path = "/api/auth/signin") {
      token = null;
    }

    if (contentType == "multipart/form-data") {
      auth = token ? { Authorization: `Bearer ${token}` } : {};
    } else {
      auth = token
        ? { Authorization: `Bearer ${token}`, "Content-Type": contentType }
        : { "Content-Type": contentType };
    }

    init["headers"] = auth;
    const promise = fetch(apiUri + path, init).catch((error) => {
      console.error("Error:", error);
      console.log("server is down!!");
      return Promise.resolve(new Response({}, { status: serverDownCode }));
    });
    return promise;
  }

  if (refresh === true) {
    return authRenewToken().then(() => {
      return helper(contentType);
    })
  }

  return helper(contentType);
}

export const authRenewToken = async (contentType = "application/json") => {
  console.log("Token is renewed.");
  const res = await fetch(apiUri + "/api/auth/refreshtoken", {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: JSON.stringify({
      refreshToken: localStorage.getItem("refreshToken"),
    }),
  });
  const token = await res.json();
  const newToken = token["accessToken"];
  if (res.status === 200) {
    localStorage.setItem("accessToken", newToken);
  }
};
