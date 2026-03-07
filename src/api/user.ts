import { useApi } from "./api-config";
import { sendApi } from "./api-helpers";
import type { User } from "../types/models";

class UserApi {

  registerUser({
    firstName,
    lastName,
    email,
    password,
    role,
    mobile,
  }: User): Promise<Response> | undefined {
    if (useApi) {
      return sendApi("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          role,
          mobile,
        }),
      });
    }
  }

}

export const userApi = new UserApi();
