import type { ApiResponse } from "../types/api";
import type { AuthResponse, User } from "../types/models";
import { sendApi } from "./api-helpers";

const sendApiHelper = async <T = unknown>(
  path: string,
  init: RequestInit = {},
  refresh: boolean = true
): Promise<ApiResponse<T> | Response> => {
  const response = await sendApi(path, init, refresh);
  try {
    return { response: await response.json() as T, type: response.ok ? "success" : "error" };
  } catch {
    console.log(response, 55);
    return response;
  }
};

export const authLogin = async ({ email, password }: { email: string; password: string }): Promise<ApiResponse<AuthResponse> | Response> => {
  console.log("authlogin");
  const res = await sendApiHelper<AuthResponse>("/api/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }, false);
  if ((res as ApiResponse<AuthResponse>).type === "success") {
    localStorage.setItem("accessToken", (res as ApiResponse<AuthResponse>).response.accessToken);
    localStorage.setItem("refreshToken", (res as ApiResponse<AuthResponse>).response.refreshToken);
  }
  return res;
};

export const authRenewToken = async (): Promise<void> => {
  const res = await sendApiHelper<AuthResponse>("/api/auth/refreshtoken", {
    method: "POST",
    refreshToken: localStorage.getItem("refreshToken"),
  } as RequestInit);

  if ((res as ApiResponse<AuthResponse>).type === "success") {
    localStorage.setItem("accessToken", (res as ApiResponse<AuthResponse>).response.accessToken);
  }
};

export const authLogOut = async (): Promise<void> => {
  const res = await sendApiHelper("/api/auth/signout", { method: "POST" });
  if ((res as ApiResponse<unknown>).type === "success") {
    localStorage.removeItem("accessToken");
  }
};

export const authSignUp = async (data: Partial<User>): Promise<ApiResponse<unknown> | Response> => {
  const res = await sendApiHelper("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res;
};

export const authEditProfile = async (data: Partial<User>): Promise<ApiResponse<unknown> | Response> => {
  const res = await sendApiHelper("/api/auth/edit", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res;
};

export const authGetProfile = async (): Promise<ApiResponse<User> | Response> => {
  const res = sendApiHelper<User>("/api/auth/profile", {}, false);
  return res;
};

export const authGetAccounts = async (): Promise<ApiResponse<User[]> | Response> => {
  const res = sendApiHelper<User[]>("/api/auth/accounts");
  return res;
};

export const authDeleteUserAdmin = async (id: number | string): Promise<ApiResponse<unknown> | Response> => {
  const res = await sendApiHelper(`/api/auth/deleteUserAdmin/${id}`, {
    method: "DELETE",
  });
  return res;
};

export const authDeleteTechAdmin = async (id: number | string): Promise<ApiResponse<unknown> | Response> => {
  const res = await sendApiHelper(`/api/auth/deleteTechAdmin/${id}`, {
    method: "DELETE",
  });
  return res;
};
