import { apiUri } from "./api-config";

export function encodeArrayForSpring(array) {
  const arrString = JSON.stringify(array);
  return encodeURIComponent(arrString.substring(1, arrString.length - 1));
}

export const serverDownCode = 599;

export function sendApi(path, init = {}, refresh = true, contentType = "application/json") {
  // 1. try once with access token
  // 2. if cannot, try once again after renewing token

  //console.log("token before",localStorage.getItem("accessToken"));
  //console.log("token after", localStorage.getItem("accessToken"));

  function helper(contentType) {
    const token = localStorage.getItem("accessToken");
    var auth = {};
    if (contentType == "multipart/form-data") {
      auth = token ? { Authorization: `Bearer ${token}` } : {};
    } else {
      auth = token
        ? { Authorization: `Bearer ${token}`, "Content-Type": contentType }
        : { "Content-Type": contentType };
    }

    init["headers"] = auth;
    //console.log(init);
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

//   return helper(contentType).then((response) => {
//     if (response.status === 401 || response.status === 404) {
//       // Renew the token and try again
//       console.log("renew");
//       //console.log("before", localStorage.getItem("accessToken"));
//       return authRenewToken().then(() => {
//         //console.log("after", localStorage.getItem("accessToken"));
//         return helper(contentType);
//       });
//     } else {
//       // Return the original response
//       return response;
//     }
//   }
// );
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
