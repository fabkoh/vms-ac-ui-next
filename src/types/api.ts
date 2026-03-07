export type ApiResponse<T> = {
  response: T;
  type: "success" | "error";
};

export type SendApiFunction = (
  path: string,
  init?: RequestInit,
  refresh?: boolean,
  contentType?: string
) => Promise<Response>;
