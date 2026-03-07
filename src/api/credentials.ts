import { useApi } from "./api-config";
import { sendApi } from "./api-helpers";
import type { Credential } from "../types/models";

const getCredentialsApi = (): Promise<Response> | undefined => {
  if (useApi) { return sendApi("/api/credentials"); }
};

const saveCredentialApi = (
  {
    credId,
    credUid,
    credTTL,
    isValid,
    isPerm,
    credTypeId,
  }: Omit<Credential, "personId">,
  personId: number,
  newCred: boolean
): Promise<Response> | undefined => {
  if (credTTL == null) {
    credTTL = new Date();
  }
  if (useApi) {
    if (newCred) {
      return sendApi("/api/credential", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          credId,
          credUid,
          credTTL,
          isValid,
          isPerm,
          personId,
          credTypeId,
        }),
      });
    }
    return sendApi("/api/credential", {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        credId,
        credUid,
        credTTL,
        isValid,
        isPerm,
        credTypeId,
        personId,
      }),
    });
  }
};

const checkCredentialApi = (
  {
    credId,
    credUid,
    credTTL,
    isValid,
    isPerm,
    credTypeId,
  }: Omit<Credential, "personId">,
  personId: number
): Promise<Response> | undefined => {
  if (credTTL == null) {
    credTTL = new Date();
  }
  if (useApi) {
    return sendApi("/api/credential/check", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        credId,
        credUid,
        credTTL,
        isValid,
        isPerm,
        personId,
        credTypeId,
      }),
    });
  }
};

const getCredentialWherePersonIdApi = (personId: number | string): Promise<Response> | undefined => {
  if (useApi) {
    return sendApi("/api/credentials?personid=" + encodeURIComponent(personId));
  }
};

const findPersonWithCredUid = (credUid: string): Promise<Response> | undefined => {
  if (useApi) {
    return sendApi("/api/lostcredentials?creduid=" + encodeURIComponent(credUid));
  }
};

const enableCredentialWithIdApi = (credId: number | string): Promise<Response> | undefined => {
  if (useApi) return sendApi(`/api/credential/${encodeURIComponent(credId)}/enable`, { method: "PUT" });
};

const disableCredentialWithIdApi = (credId: number | string): Promise<Response> | undefined => {
  if (useApi) return sendApi(`/api/credential/${encodeURIComponent(credId)}/disable`, { method: "PUT" });
};

const deleteCredentialApi = (credId: number | string): Promise<Response> | undefined => {
  if (useApi) return sendApi(`/api/credential/${encodeURIComponent(credId)}`, { method: "DELETE" });
};

export {
  getCredentialsApi,
  checkCredentialApi,
  saveCredentialApi,
  getCredentialWherePersonIdApi,
  enableCredentialWithIdApi,
  disableCredentialWithIdApi,
  deleteCredentialApi,
  findPersonWithCredUid,
};
