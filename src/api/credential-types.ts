import { useApi } from "./api-config";
import { sendApi } from "./api-helpers";

const getCredTypesApi = (): Promise<Response> => {
  if (useApi) {
    return sendApi("/api/credential-types");
  }
  return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
};

export { getCredTypesApi };
